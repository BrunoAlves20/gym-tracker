// app/api/fix-exercises/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Puxa um catálogo de exercícios open-source que contém links de GIFs confiáveis
    const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const exercises = await res.json();

    // Vamos inserir apenas os primeiros 100 exercícios mais comuns para ser rápido
    const topExercises = exercises.slice(0, 100);

    let inseridos = 0;

    for (const ex of topExercises) {
      // O JSON deles usa propriedades em inglês (name, target, equipment, gifUrl)
      await query(
        `INSERT INTO exercises (id, name, target_muscle, equipment, gif_url, instructions)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET 
            gif_url = EXCLUDED.gif_url,
            name = EXCLUDED.name`,
        [
          ex.id, 
          ex.name, 
          ex.target, 
          ex.equipment, 
          ex.gifUrl, // Aqui entra o link real do GIF!
          ex.instructions ? ex.instructions.join(' ') : 'Siga a animação visual.'
        ]
      );
      inseridos++;
    }

    return NextResponse.json({
      status: 'sucesso',
      message: `${inseridos} exercícios foram atualizados com GIFs reais!`,
    });

  } catch (error: any) {
    console.error('Erro ao atualizar GIFs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}