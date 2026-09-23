// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const USER_ID = '00000000-0000-0000-0000-000000000001';

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);

  // Formulário da Entrevista
  const [formData, setFormData] = useState({
    goal: 'Hipertrofia e Ganho de Massa',
    experienceLevel: 'Iniciante',
    frequencyDays: 3,
    workoutDuration: 60,
    limitations: ''
  });

  // Busca se já existe um treino ativo ao carregar
  useEffect(() => {
    fetchActivePlan();
  }, []);

  async function fetchActivePlan() {
    try {
      const res = await fetch(`/api/user-plan?userId=${USER_ID}`);
      const data = await res.json();
      if (data.plan) {
        setActivePlan(data.plan);
      }
    } catch (err) {
      console.error('Erro ao carregar plano existente:', err);
    }
  }

  async function handleFinishInterview() {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          goal: formData.goal,
          experienceLevel: formData.experienceLevel.toLowerCase(),
          frequencyDays: Number(formData.frequencyDays),
          workoutDuration: Number(formData.workoutDuration),
          limitations: formData.limitations || 'Nenhuma'
        })
      });

      if (!res.ok) throw new Error('Falha ao gerar treino');
      
      await fetchActivePlan();
      setStep(1);
    } catch (err: any) {
      alert('Erro ao criar treino: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#111' }}>
      
      <header style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>💪 Gym AI Coach</h1>
          <p style={{ color: '#666', marginTop: '4px', margin: 0 }}>Seu personal trainer inteligente com progressão comprovada.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link 
            href="/evolucao"
            style={{ 
              backgroundColor: '#f0f0f0', 
              color: '#111', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              border: '1px solid #ccc'
            }}
          >
            📈 Ver Evolução
          </Link>

          {activePlan && (
            <Link 
              href="/treinar"
              style={{ 
                backgroundColor: '#28a745', 
                color: '#fff', 
                padding: '10px 18px', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: 'bold'
              }}
            >
              🚀 Iniciar Treino
            </Link>
          )}
        </div>
      </header>

      {/* Caso não tenha plano gerado ou esteja refazendo */}
      {!activePlan && (
        <section style={{ background: '#f9f9f9', padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <h2 style={{ marginTop: 0 }}>📋 Avaliação com o Instrutor IA</h2>
          <p style={{ color: '#555' }}>Responda às perguntas para que a inteligência artificial monte a divisão ideal para sua rotina.</p>

          {step === 1 && (
            <div>
              <h3>1. Qual é o seu objetivo principal?</h3>
              {['Hipertrofia e Ganho de Massa', 'Emagrecimento e Definição', 'Força Pura', 'Condicionamento Geral'].map((item) => (
                <label key={item} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="goal"
                    checked={formData.goal === item}
                    onChange={() => setFormData({ ...formData, goal: item })}
                  />
                  <span style={{ marginLeft: '8px' }}>{item}</span>
                </label>
              ))}
              <button 
                onClick={() => setStep(2)}
                style={{ marginTop: '16px', padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Próximo
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>2. Qual é a sua experiência e disponibilidade semanal?</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Nível:</label>
                <select 
                  value={formData.experienceLevel} 
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  style={{ padding: '8px', width: '100%', maxWidth: '300px' }}>
                  <option value="Iniciante">Iniciante (menos de 6 meses)</option>
                  <option value="Intermediário">Intermediário (6 meses a 2 anos)</option>
                  <option value="Avançado">Avançado (mais de 2 anos)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Quantos dias por semana pretende treinar?</label>
                <select 
                  value={formData.frequencyDays} 
                  onChange={(e) => setFormData({ ...formData, frequencyDays: Number(e.target.value) })}
                  style={{ padding: '8px', width: '100%', maxWidth: '300px' }}>
                  <option value={3}>3 dias na semana</option>
                  <option value={4}>4 dias na semana</option>
                  <option value={5}>5 dias na semana</option>
                  <option value={6}>6 dias na semana</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(1)} style={{ padding: '10px 16px', background: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Voltar</button>
                <button onClick={() => setStep(3)} style={{ padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Próximo</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>3. Dores, lesões ou restrições físicas?</h3>
              <textarea
                placeholder="Ex: dor no ombro esquerdo ao supinar, condromalácia no joelho, sem restrições..."
                value={formData.limitations}
                onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setStep(2)} style={{ padding: '10px 16px', background: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Voltar</button>
                <button 
                  onClick={handleFinishInterview}
                  disabled={loading}
                  style={{ padding: '10px 24px', background: loading ? '#888' : '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Montando seu treino ideal...' : 'Finalizar e Gerar Treino'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Exibição da Ficha de Treino */}
      {activePlan && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0 }}>{activePlan.title}</h2>
              <p style={{ color: '#555', marginTop: '4px' }}>{activePlan.description}</p>
            </div>
            <button 
              onClick={() => setActivePlan(null)}
              style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>
              Refazer Avaliação
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {activePlan.days.map((day: any) => (
              <div key={day.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                <h3 style={{ margin: '0 0 12px 0', borderBottom: '2px solid #0070f3', paddingBottom: '6px', display: 'inline-block' }}>
                  {day.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {day.exercises.map((ex: any) => (
                    <div key={ex.plan_exercise_id} style={{ display: 'flex', gap: '16px', padding: '12px', background: '#fafafa', borderRadius: '6px', alignItems: 'center' }}>
                      {ex.gif_url && (
                        <img 
                          src={ex.gif_url} 
                          alt={ex.name} 
                          style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', textTransform: 'capitalize' }}>{ex.name}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          <span><strong>Músculo:</strong> {ex.target_muscle}</span> | 
                          <span style={{ marginLeft: '6px' }}><strong>Equipamento:</strong> {ex.equipment}</span>
                        </div>
                        <div style={{ marginTop: '6px', fontWeight: 'bold', fontSize: '0.9rem', color: '#0070f3' }}>
                          {ex.target_sets} séries × {ex.target_reps} reps | Descanso: {ex.rest_seconds}s
                        </div>
                        {ex.notes && <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#777' }}>Nota: {ex.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}