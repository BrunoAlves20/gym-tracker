// app/api/logged-exercises/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

  try {
    const result = await query(
      `SELECT DISTINCT e.id, e.name, e.target_muscle
       FROM workout_log_sets wls
       JOIN workout_logs wl ON wls.log_id = wl.id
       JOIN exercises e ON wls.exercise_id = e.id
       WHERE wl.user_id = $1
       ORDER BY e.name ASC`,
      [userId]
    );

    return NextResponse.json({ exercises: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}