// app/api/update-exercise/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { exerciseId, gifUrl } = await request.json();

    if (!exerciseId || !gifUrl) {
      return NextResponse.json({ error: 'Faltam dados.' }, { status: 400 });
    }

    // Atualiza o link do exercício no Neon
    await query(
      'UPDATE exercises SET gif_url = $1 WHERE id = $2',
      [gifUrl, exerciseId]
    );

    return NextResponse.json({ success: true, message: 'Exercício atualizado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao atualizar exercício:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}