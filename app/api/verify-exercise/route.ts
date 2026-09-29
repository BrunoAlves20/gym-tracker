// app/api/verify-exercise/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { exerciseId, status } = await request.json(); // status: 'verified' | 'rejected'

    if (!exerciseId || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    await query(
      `UPDATE exercises 
       SET media_status = $1, verified_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [status, exerciseId]
    );

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error('Erro ao verificar exercício:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}