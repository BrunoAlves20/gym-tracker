// app/evolucao/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const USER_ID = '00000000-0000-0000-0000-000000000001';

interface ProgressPoint {
  session_date: string;
  max_weight: string | number;
  total_volume_kg: string | number;
}

export default function EvolucaoPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [history, setHistory] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega a lista de exercícios que já possuem logs
  useEffect(() => {
    async function loadExercises() {
      try {
        const res = await fetch(`/api/logged-exercises?userId=${USER_ID}`);
        const data = await res.json();
        if (data.exercises && data.exercises.length > 0) {
          setExercises(data.exercises);
          setSelectedExerciseId(data.exercises[0].id);
        }
      } catch (err) {
        console.error('Erro ao buscar exercícios treinados:', err);
      }
    }
    loadExercises();
  }, []);

  // Carrega o histórico sempre que mudar o exercício selecionado
  useEffect(() => {
    if (!selectedExerciseId) return;

    async function loadProgress() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exercise-progress?exerciseId=${selectedExerciseId}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [selectedExerciseId]);

  // Cálculos para desenhar o gráfico SVG
  const weights = history.map(h => Number(h.max_weight));
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
  const range = maxWeight === minWeight ? 10 : maxWeight - minWeight;

  const width = 600;
  const height = 220;
  const padding = 35;

  const points = history.map((h, i) => {
    const x = padding + (i / Math.max(1, history.length - 1)) * (width - padding * 2);
    const y = height - padding - ((Number(h.max_weight) - minWeight) / range) * (height - padding * 2);
    return { x, y, ...h };
  });

  const svgPath = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>← Voltar para Ficha</Link>
        <Link 
          href="/treinar" 
          style={{ background: '#28a745', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
          + Registrar Novo Treino
        </Link>
      </div>

      <h1 style={{ margin: '0 0 8px 0' }}>📈 Comprovação de Resultados</h1>
      <p style={{ color: '#666', marginTop: 0, marginBottom: '24px' }}>
        Acompanhe a sobrecarga progressiva e o volume de carga que você construiu.
      </p>

      {exercises.length === 0 ? (
        <div style={{ padding: '24px', background: '#f8f9fa', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>
            Nenhum treino registrado ainda para gerar gráficos. Faça sua primeira sessão na tela de <strong>Iniciar Treino</strong>.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Selecione o Exercício:</label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              style={{ padding: '10px', width: '100%', maxWidth: '350px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', textTransform: 'capitalize' }}
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.target_muscle})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p>Carregando dados de evolução...</p>
          ) : (
            <div>
              {/* Gráfico de Carga Máxima */}
              <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0' }}>Evolução de Carga Máxima (kg)</h3>

                {history.length > 0 ? (
                  <div>
                    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#fafafa', borderRadius: '8px' }}>
                      {/* Linha guia de base */}
                      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ddd" strokeWidth="1" />
                      
                      {/* Curva de progressão */}
                      {points.length > 1 && (
                        <path d={svgPath} fill="none" stroke="#0070f3" strokeWidth="3" />
                      )}

                      {/* Pontos de dados */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="6" fill="#0070f3" stroke="#fff" strokeWidth="2" />
                          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#111">
                            {Number(p.max_weight)}kg
                          </text>
                          <text x={p.x} y={height - 12} textAnchor="middle" fontSize="10" fill="#888">
                            {new Date(p.session_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>Sem sessões salvas para este exercício ainda.</p>
                )}
              </div>

              {/* Tabela de Histórico de Volume Total */}
              <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0' }}>Histórico Detalhado por Sessão</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '8px' }}>Data</th>
                      <th style={{ padding: '8px' }}>Carga Máxima</th>
                      <th style={{ padding: '8px' }}>Volume Total Levantado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 8px' }}>
                          {new Date(row.session_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#0070f3' }}>
                          {Number(row.max_weight)} kg
                        </td>
                        <td style={{ padding: '10px 8px', color: '#333' }}>
                          {Number(row.total_volume_kg).toLocaleString('pt-BR')} kg acumulados
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}