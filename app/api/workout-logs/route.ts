// app/api/workout-logs/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, workoutDayId, sessionRating, userFeedback, sets } = body;

    if (!userId || !sets || sets.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos para registrar o treino.' },
        { status: 400 }
      );
    }

    // 1. Cria a sessão do treino
    const logRes = await query(
      `INSERT INTO workout_logs (user_id, workout_day_id, session_rating, user_feedback, ended_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, workoutDayId || null, sessionRating || 5, userFeedback || '']
    );

    const logId = logRes.rows[0].id;

    // 2. Insere todas as séries executadas
    for (const s of sets) {
      await query(
        `INSERT INTO workout_log_sets (log_id, exercise_id, set_number, reps_completed, weight_kg, rpe)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          logId,
          s.exerciseId,
          s.setNumber,
          s.repsCompleted,
          s.weightKg,
          s.rpe || 8
        ]
      );
    }

    return NextResponse.json({
      status: 'sucesso',
      message: 'Treino registrado com sucesso!',
      logId
    });
  } catch (error: any) {
    console.error('Erro ao salvar execução do treino:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}