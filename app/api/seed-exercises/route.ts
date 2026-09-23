// app/api/seed-exercises/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey || rapidApiKey === 'sua_chave_aqui') {
    return NextResponse.json(
      { error: 'Chave RAPIDAPI_KEY não configurada no .env.local' },
      { status: 400 }
    );
  }

  try {
    // 1. Busca os exercícios da ExerciseDB (limitado aos primeiros 150 para teste rápido e seguro)
    const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=150', {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha na chamada da RapidAPI: ${response.statusText}`);
    }

    const exercises = await response.json();

    let insertedCount = 0;

    // 2. Itera e insere no PostgreSQL
    for (const ex of exercises) {
      const instructionsText = Array.isArray(ex.instructions) 
        ? ex.instructions.join(' ') 
        : (ex.instructions || '');

      await query(
        `INSERT INTO exercises (id, name, target_muscle, secondary_muscles, equipment, gif_url, instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name,
             target_muscle = EXCLUDED.target_muscle,
             gif_url = EXCLUDED.gif_url;`,
        [
          ex.id,
          ex.name,
          ex.target,
          ex.secondaryMuscles || [],
          ex.equipment,
          ex.gifUrl,
          instructionsText
        ]
      );
      insertedCount++;
    }

    return NextResponse.json({
      status: 'sucesso',
      message: `${insertedCount} exercícios importados com sucesso para o banco de dados!`,
    });
  } catch (error: any) {
    console.error('Erro no seed de exercícios:', error);
    return NextResponse.json(
      { status: 'erro', message: error.message },
      { status: 500 }
    );
  }
}