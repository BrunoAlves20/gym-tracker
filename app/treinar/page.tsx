// app/treinar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ExerciseImage from '@/components/ExerciseImage';

const USER_ID = 1;

export default function TreinarPage() {
  const [plan, setPlan] = useState<any>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | string>('');
  const [logData, setLogData] = useState<Record<string, { reps: number; weight: number }[]>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      const res = await fetch(`/api/user-plan?userId=${USER_ID}`);
      const data = await res.json();
      if (data.plan && data.plan.days.length > 0) {
        setPlan(data.plan);
        setSelectedDayId(data.plan.days[0].id);
      }
    }
    loadPlan();
  }, []);

  const currentDay = plan?.days.find((d: any) => d.id === selectedDayId);

  useEffect(() => {
    if (currentDay) {
      const initial: Record<string, { reps: number; weight: number }[]> = {};
      currentDay.exercises.forEach((ex: any) => {
        initial[ex.exercise_id] = Array.from({ length: ex.target_sets }, () => ({
          reps: 10,
          weight: 20
        }));
      });
      setLogData(initial);
      setSavedSuccess(false);
    }
  }, [selectedDayId, currentDay]);

  function handleInputChange(exerciseId: string, setIndex: number, field: 'reps' | 'weight', val: number) {
    setLogData(prev => {
      const currentSets = [...(prev[exerciseId] || [])];
      currentSets[setIndex] = {
        ...currentSets[setIndex],
        [field]: val
      };
      return { ...prev, [exerciseId]: currentSets };
    });
  }

  async function handleFinishWorkout() {
    setSaving(true);
    try {
      const setsToSave: any[] = [];

      Object.entries(logData).forEach(([exerciseId, sets]) => {
        sets.forEach((s, idx) => {
          setsToSave.push({
            exerciseId,
            setNumber: idx + 1,
            repsCompleted: Number(s.reps),
            weightKg: Number(s.weight),
            rpe: 8
          });
        });
      });

      const res = await fetch('/api/workout-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          workoutDayId: selectedDayId,
          sessionRating: 5,
          userFeedback: 'Treino concluído com sucesso',
          sets: setsToSave
        })
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      setSavedSuccess(true);
    } catch (err: any) {
      alert('Falha ao registrar treino: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!plan) {
    return (
      <div style={{ backgroundColor: '#121418', minHeight: '100vh', color: '#fff', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        Carregando treino... Caso ainda não tenha gerado, <Link href="/" style={{ color: '#6a4df4' }}>clique aqui</Link>.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#121418', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        {/* Barra Superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#6a4df4', fontWeight: 'bold' }}>← Voltar para Ficha</Link>
          <span style={{ fontSize: '0.85rem', color: '#888', backgroundColor: '#1f222a', padding: '6px 12px', borderRadius: '12px' }}>
            Sessão Ativa
          </span>
        </div>

        <h1 style={{ margin: '0 0 16px 0', fontSize: '1.8rem', fontWeight: 'bold' }}>🏋️ Iniciar Treino</h1>

        {/* Abas dos Dias de Treino */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '6px' }}>
          {plan.days.map((day: any) => (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: selectedDayId === day.id ? '#6a4df4' : '#1f222a',
                color: selectedDayId === day.id ? '#fff' : '#a4b0be',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {day.name}
            </button>
          ))}
        </div>

        {savedSuccess && (
          <div style={{ padding: '16px', backgroundColor: '#1b2d2a', color: '#2ed573', borderRadius: '12px', marginBottom: '24px', border: '1px solid #2ed573' }}>
            ✅ <strong>Treino registrado com sucesso!</strong> Seu marcador de consistência e gráficos de evolução foram atualizados.
          </div>
        )}

        {/* Lista de Exercícios com Imagem/GIF em Destaque */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {currentDay?.exercises.map((ex: any) => (
            <div 
              key={ex.exercise_id} 
              style={{ 
                backgroundColor: '#181a20', 
                border: '1px solid #262a34', 
                borderRadius: '16px', 
                padding: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}
            >
              {/* Header do Exercício com GIF via Proxy */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <ExerciseImage url={ex.gif_url} name={ex.name} />

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', textTransform: 'capitalize', fontSize: '1.2rem', color: '#fff' }}>
                    {ex.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#262a34', color: '#6a4df4', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {ex.target_muscle}
                    </span>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#262a34', color: '#a4b0be', padding: '3px 8px', borderRadius: '6px' }}>
                      {ex.equipment}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a4b0be' }}>
                    Meta: <strong>{ex.target_sets} séries × {ex.target_reps} reps</strong> (descanso {ex.rest_seconds}s)
                  </div>
                </div>
              </div>

              {/* Tabela de Séries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logData[ex.exercise_id]?.map((set, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#1f222a',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #2b2f3a'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>
                      Série {idx + 1}
                    </span>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#a4b0be' }}>
                        Kg:
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleInputChange(ex.exercise_id, idx, 'weight', Number(e.target.value))}
                          style={{
                            width: '65px',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #35383f',
                            backgroundColor: '#121418',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        />
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#a4b0be' }}>
                        Reps:
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleInputChange(ex.exercise_id, idx, 'reps', Number(e.target.value))}
                          style={{
                            width: '55px',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #35383f',
                            backgroundColor: '#121418',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botão de Finalização */}
        <button
          onClick={handleFinishWorkout}
          disabled={saving}
          style={{
            marginTop: '32px',
            marginBottom: '40px',
            width: '100%',
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: saving ? '#555' : '#6a4df4',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 18px rgba(106, 77, 244, 0.4)'
          }}
        >
          {saving ? 'Gravando no Neon...' : 'Concluir e Salvar Treino'}
        </button>

      </div>
    </div>
  );
}