// app/api/create-test-user/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      INSERT INTO users (id, name, email) 
      VALUES ('00000000-0000-0000-0000-000000000001', 'Aluno Teste', 'teste@gym.com')
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `);

    return NextResponse.json({
      status: 'sucesso',
      message: 'Usuário de teste pronto para uso!',
      user: result.rows[0] || 'Usuário já existia'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}