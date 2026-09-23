// app/api/generate-plan/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { query } from '@/lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      goal,
      experienceLevel,
      frequencyDays,
      workoutDuration,
      limitations
    } = body;

    // 1. Busca os exercícios cadastrados no banco para alimentar o repertório da IA
    const exercisesResult = await query('SELECT id, name, target_muscle, equipment FROM exercises');
    const availableExercises = exercisesResult.rows;

    if (availableExercises.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum exercício cadastrado no banco para montar o treino.' },
        { status: 400 }
      );
    }

    // 2. Prompt estruturado de Personal Trainer
    const systemInstruction = `
Você é um treinador de musculação de elite e especialista em biomecânica.
Sua missão é estruturar uma rotina de treino personalizada com base no perfil do aluno.

Regras obrigatórias:
1. Selecione APENAS exercícios da lista de exercícios disponíveis fornecida. Use o "id" exato de cada um.
2. Divida os treinos de forma equilibrada de acordo com o número de dias por semana informado (ex: 3 dias = ABC ou Full Body, 4 dias = Upper/Lower ou ABCD).
3. Adapte o volume (séries) e repetições ao objetivo e limitações do aluno.
4. Retorne exclusivamente o JSON estruturado conforme o esquema solicitado.
`;

    const userPrompt = `
Perfil do aluno:
- Objetivo: ${goal}
- Nível de Experiência: ${experienceLevel}
- Frequência: ${frequencyDays} dias na semana
- Tempo disponível por sessão: ${workoutDuration || 60} minutos
- Limitações/Lesões: ${limitations || 'Nenhuma'}

Lista de exercícios disponíveis no sistema (escolha apenas estes IDs):
${JSON.stringify(availableExercises.map(e => ({ id: e.id, nome: e.name, musculo: e.target_muscle })))}
`;

    // 3. Chamada ao Gemini com resposta estruturada (Schema JSON)
    // 3. Chamada ao Gemini com suporte a fallback caso haja sobrecarga temporária
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
    const planData = JSON.parse(response.text || '{}');

    // 4. Salva o Plano no Banco Neon (se foi passado um userId)
    let savedPlanId = null;

    if (userId) {
      // Cria o plano principal
      const planRes = await query(
        `INSERT INTO workout_plans (user_id, title, description, is_active, source)
         VALUES ($1, $2, $3, true, 'ai_generated') RETURNING id`,
        [userId, planData.planTitle, planData.description]
      );
      savedPlanId = planRes.rows[0].id;

      // Salva os dias e os exercícios
      for (const day of planData.days) {
        const dayRes = await query(
          `INSERT INTO workout_days (plan_id, name, day_order)
           VALUES ($1, $2, $3) RETURNING id`,
          [savedPlanId, day.name, day.dayOrder]
        );
        const dayId = dayRes.rows[0].id;

        for (let i = 0; i < day.exercises.length; i++) {
          const ex = day.exercises[i];
          await query(
            `INSERT INTO workout_day_exercises 
             (workout_day_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [dayId, ex.exerciseId, i + 1, ex.targetSets, ex.targetReps, ex.restSeconds || 90, ex.notes || '']
          );
        }
      }
    }

    return NextResponse.json({
      status: 'sucesso',
      planId: savedPlanId,
      workoutPlan: planData
    });

  } catch (error: any) {
    console.error('Erro ao gerar treino com IA:', error);
    return NextResponse.json(
      { error: 'Falha na geração do treino', details: error.message },
      { status: 500 }
    );
  }
}