// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT NOW() as current_time, count(*) as total_tables FROM information_schema.tables WHERE table_schema = $1',
      ['public']
    );

    return NextResponse.json({
      status: 'ok',
      message: 'Conexão com o Neon estabelecida com sucesso!',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erro na conexão com o banco:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}