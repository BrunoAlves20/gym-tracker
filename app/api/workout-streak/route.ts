// app/api/workout-streak/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '1';

  try {
    const result = await query(
      `SELECT DISTINCT DATE(started_at) as workout_date
       FROM workout_logs
       WHERE user_id = $1
       ORDER BY workout_date DESC`,
      [userId]
    );

    // Converte para uma lista simples de datas no formato 'YYYY-MM-DD'
    const dates = result.rows.map((row: any) => {
      const d = new Date(row.workout_date);
      return d.toISOString().split('T')[0];
    });

    return NextResponse.json({ trainedDates: dates });
  } catch (error: any) {
    console.error('Erro ao buscar consistência de treinos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}