// app/api/user-plan/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';

  try {
    // 1. Busca o plano ativo mais recente
    const planRes = await query(
      `SELECT id, title, description, created_at 
       FROM workout_plans 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (planRes.rows.length === 0) {
      return NextResponse.json({ plan: null });
    }

    const plan = planRes.rows[0];

    // 2. Busca os dias do plano
    const daysRes = await query(
      `SELECT id, name, day_order 
       FROM workout_days 
       WHERE plan_id = $1 
       ORDER BY day_order ASC`,
      [plan.id]
    );

    const days = [];

    // 3. Para cada dia, busca os exercícios detalhados com GIF e instruções
    for (const day of daysRes.rows) {
      const exRes = await query(
        `SELECT 
            wde.id as plan_exercise_id,
            wde.order_index,
            wde.target_sets,
            wde.target_reps,
            wde.rest_seconds,
            wde.notes,
            e.id as exercise_id,
            e.name,
            e.target_muscle,
            e.equipment,
            e.gif_url,
            e.instructions
         FROM workout_day_exercises wde
         JOIN exercises e ON wde.exercise_id = e.id
         WHERE wde.workout_day_id = $1
         ORDER BY wde.order_index ASC`,
        [day.id]
      );

      days.push({
        ...day,
        exercises: exRes.rows
      });
    }

    return NextResponse.json({
      plan: {
        ...plan,
        days
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar plano do usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}