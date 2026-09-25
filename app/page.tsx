// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const USER_ID = 1;

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  // Formulário da Entrevista
  const [formData, setFormData] = useState({
    goal: 'Hipertrofia e Ganho de Massa',
    experienceLevel: 'Iniciante',
    frequencyDays: 3,
    workoutDuration: 60,
    limitations: ''
  });

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
      console.error('Erro ao carregar plano:', err);
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
      
      {/* Cabeçalho */}
      <header style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>💪 Gym AI Coach</h1>
          <p style={{ color: '#666', marginTop: '4px', margin: 0 }}>Seu personal trainer inteligente com progressão comprovada.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link 
            href="/evolucao"
            style={{ backgroundColor: '#f0f0f0', color: '#111', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #ccc' }}>
            📈 Ver Evolução
          </Link>

          {activePlan && (
            <Link 
              href="/treinar"
              style={{ backgroundColor: '#6a4df4', color: '#fff', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              🚀 Iniciar Treino Hoje
            </Link>
          )}
        </div>
      </header>

      {/* Questionário se não houver plano */}
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
                placeholder="Ex: dor no ombro esquerdo, lesão no joelho..."
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

      {/* Exibição da Ficha Ativa */}
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
              <div key={day.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '18px', background: '#fff' }}>
                <h3 style={{ margin: '0 0 14px 0', borderBottom: '2px solid #0070f3', paddingBottom: '6px', display: 'inline-block' }}>
                  {day.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {day.exercises.map((ex: any) => (
                    <div 
                      key={ex.plan_exercise_id}
                      onClick={() => setSelectedExercise(ex)}
                      style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        padding: '12px', 
                        background: '#fafafa', 
                        borderRadius: '10px', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        border: '1px solid #eee'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Miniatura com validação segura de existência de link */}
                      {ex.gif_url ? (
                        <img 
                          src={ex.gif_url} 
                          alt={ex.name} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          style={{ width: '75px', height: '75px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#e9ecef' }}
                        />
                      ) : (
                        <div style={{ width: '75px', height: '75px', borderRadius: '8px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          🏋️
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: '0 0 4px 0', textTransform: 'capitalize', fontSize: '1.05rem' }}>{ex.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#6a4df4', fontWeight: 'bold' }}>🔍 Clique para expandir</span>
                        </div>
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

      {/* Modal / Popup de Expansão do Exercício */}
      {selectedExercise && (
        <div 
          onClick={() => setSelectedExercise(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#181a20',
              color: '#fff',
              maxWidth: '500px',
              width: '100%',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            {/* Botão de Fechar */}
            <button 
              onClick={() => setSelectedExercise(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#262a34',
                color: '#fff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>

            <h2 style={{ marginTop: 0, marginBottom: '6px', textTransform: 'capitalize' }}>
              {selectedExercise.name}
            </h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ backgroundColor: '#262a34', color: '#6a4df4', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {selectedExercise.target_muscle}
              </span>
              <span style={{ backgroundColor: '#262a34', color: '#a4b0be', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                {selectedExercise.equipment}
              </span>
            </div>

            {/* Imagem Ampliada */}
            {selectedExercise.gif_url ? (
              <img 
                src={selectedExercise.gif_url} 
                alt={selectedExercise.name}
                referrerPolicy="no-referrer"
                style={{
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  marginBottom: '16px',
                  border: '1px solid #35383f'
                }} 
              />
            ) : (
              <div style={{ width: '100%', height: '180px', backgroundColor: '#262a34', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '16px' }}>
                🏋️
              </div>
            )}

            {/* Instruções de Execução Biomecânica */}
            <div style={{ backgroundColor: '#1f222a', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#2ed573', fontSize: '0.9rem' }}>Como Executar:</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#ccc', lineHeight: '1.4' }}>
                {selectedExercise.instructions || 'Execute o movimento com amplitude controlada e foco na contração muscular.'}
              </p>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#a4b0be' }}>
              Meta prescrita: <strong style={{ color: '#fff' }}>{selectedExercise.target_sets} séries × {selectedExercise.target_reps} repetições</strong> (descanso {selectedExercise.rest_seconds}s)
            </div>
          </div>
        </div>
      )}

    </div>
  );
}