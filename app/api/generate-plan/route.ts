// app/api/generate-plan/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { query } from '@/lib/db';

const ai = new GoogleGenAI();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, goal, experienceLevel, frequencyDays, workoutDuration, limitations } = body;

    // 1. Busca no Neon os exercícios que possuem mídia/GIF cadastrados
    const exercisesResult = await query(
      `SELECT id, name, target_muscle, equipment 
       FROM exercises 
       WHERE gif_url IS NOT NULL`
    );

    const availableExercises = exercisesResult.rows;

    if (availableExercises.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum exercício com GIF encontrado no banco de dados.' },
        { status: 400 }
      );
    }

    // 2. Monta o catálogo fechado para a IA
    const catalogList = availableExercises
      .map((ex: any) => `- ID: "${ex.id}" | Nome: "${ex.name}" | Músculo: ${ex.target_muscle} | Equipamento: ${ex.equipment}`)
      .join('\n');

    const systemInstruction = `
Você é um treinador de musculação de elite com foco em biomecânica e sobrecarga progressiva.
Gere planos de treino estruturados, seguros e altamente eficientes.

REGRA MANDATÓRIA ABSOLUTA:
Você DEVE selecionar os exercícios EXCLUSIVAMENTE a partir do catálogo a seguir.
NÃO invente nenhum nome ou ID. Use rigorosamente o campo "ID" informado entre aspas.

CATÁLOGO PERMITIDO:
${catalogList}
`;

    const userPrompt = `
Monte uma periodização personalizada para o aluno:
- Objetivo: ${goal}
- Nível de Experiência: ${experienceLevel}
- Frequência Semanal: ${frequencyDays} dias
- Duração da Sessão: ${workoutDuration} minutos
- Limitações / Dores: ${limitations || 'Nenhuma'}

Distribua os treinos uniformemente pelos ${frequencyDays} dias respeitando o descanso dos grupos musculares.
`;

    // 3. Fallback original resiliente com @google/genai e schema estrito
    const generateWithFallback = async () => {
      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  planTitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        dayOrder: { type: Type.INTEGER },
                        exercises: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              exerciseId: { type: Type.STRING },
                              targetSets: { type: Type.INTEGER },
                              targetReps: { type: Type.STRING },
                              restSeconds: { type: Type.INTEGER },
                              notes: { type: Type.STRING }
                            },
                            required: ['exerciseId', 'targetSets', 'targetReps', 'restSeconds']
                          }
                        }
                      },
                      required: ['name', 'dayOrder', 'exercises']
                    }
                  }
                },
                required: ['planTitle', 'description', 'days']
              }
            }
          });
          return res;
        } catch (err: any) {
          console.warn(`Modelo ${model} indisponível ou com alta demanda, tentando próximo...`);
          lastError = err;
        }
      }
      throw lastError;
    };

    const response = await generateWithFallback();
    const rawText = response.text || '{}';
    const planData = JSON.parse(rawText);

    // 4. Persistência transacional atômica no Neon
    await query('BEGIN');

    await query('UPDATE workout_plans SET is_active = FALSE WHERE user_id = $1', [userId]);

    const planInsert = await query(
      `INSERT INTO workout_plans (user_id, title, description, is_active)
       VALUES ($1, $2, $3, TRUE) RETURNING id`,
      [userId, planData.planTitle, planData.description]
    );
    const planId = planInsert.rows[0].id;

    for (const day of planData.days) {
      const dayInsert = await query(
        `INSERT INTO workout_days (plan_id, name, day_order)
         VALUES ($1, $2, $3) RETURNING id`,
        [planId, day.name, day.dayOrder]
      );
      const dayId = dayInsert.rows[0].id;

      let orderIdx = 1;
      for (const ex of day.exercises) {
        // Validação de segurança no catálogo cadastrado
        const checkEx = await query('SELECT id FROM exercises WHERE id = $1', [ex.exerciseId]);
        if (checkEx.rows.length > 0) {
          await query(
            `INSERT INTO workout_day_exercises (
              workout_day_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [dayId, ex.exerciseId, orderIdx, ex.targetSets, ex.targetReps, ex.restSeconds, ex.notes || null]
          );
          orderIdx++;
        }
      }
    }

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Plano gerado e salvo com sucesso.',
      planId
    });

  } catch (error: any) {
    await query('ROLLBACK');
    console.error('Erro na geração do treino:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}