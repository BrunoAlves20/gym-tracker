// app/api/exercise-progress/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exerciseId');

  if (!exerciseId) {
    return NextResponse.json({ error: 'exerciseId é obrigatório' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT 
         DATE(wl.started_at) as session_date,
         MAX(wls.weight_kg) as max_weight,
         SUM(wls.weight_kg * wls.reps_completed) as total_volume_kg
       FROM workout_log_sets wls
       JOIN workout_logs wl ON wls.log_id = wl.id
       WHERE wls.exercise_id = $1
       GROUP BY DATE(wl.started_at)
       ORDER BY session_date ASC`,
      [exerciseId]
    );

    return NextResponse.json({ history: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}