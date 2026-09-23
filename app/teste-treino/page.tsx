// app/teste-treino/page.tsx
'use client';

import { useState } from 'react';

export default function TesteTreinoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function gerarTreino() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000001',
          goal: 'hipertrofia e definição muscular',
          experienceLevel: 'iniciante',
          frequencyDays: 3,
          workoutDuration: 50,
          limitations: 'dor no joelho direito'
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ erro: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Teste do Instrutor IA</h1>
      <p>Simulação: Aluno iniciante, foco em hipertrofia, 3 dias na semana, com dor no joelho.</p>

      <button
        onClick={gerarTreino}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#888' : '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '6px'
        }}
      >
        {loading ? 'A IA está montando o treino... (aguarde ~5s)' : 'Gerar Treino com IA'}
      </button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Resultado Retornado e Salvo no Banco:</h2>
          <pre style={{ backgroundColor: '#f4f4f4', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}