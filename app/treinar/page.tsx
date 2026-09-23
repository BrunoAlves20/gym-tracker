// app/treinar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const USER_ID = '00000000-0000-0000-0000-000000000001';

export default function TreinarPage() {
  const [plan, setPlan] = useState<any>(null);
  const [selectedDayId, setSelectedDayId] = useState<string>('');
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

  // Inicializa os campos quando um dia for selecionado
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
  }, [selectedDayId]);

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
          userFeedback: 'Treino concluído via app',
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
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        Carregando treino... Caso ainda não tenha gerado, <Link href="/">clique aqui</Link>.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>← Voltar para Ficha</Link>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>Sessão Ativa</span>
      </div>

      <h1 style={{ margin: '0 0 12px 0' }}>🏋️ Iniciar Treino</h1>

      {/* Seletor de Dias */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '6px' }}>
        {plan.days.map((day: any) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayId(day.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: selectedDayId === day.id ? '#0070f3' : '#fff',
              color: selectedDayId === day.id ? '#fff' : '#333'
            }}
          >
            {day.name}
          </button>
        ))}
      </div>

      {savedSuccess && (
        <div style={{ padding: '16px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '20px' }}>
          ✅ <strong>Treino registrado com sucesso no banco!</strong> Cargas salvas para medição de evolução.
        </div>
      )}

      {/* Lista de Exercícios para Preenchimento */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {currentDay?.exercises.map((ex: any) => (
          <div key={ex.exercise_id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
            <h3 style={{ margin: '0 0 4px 0', textTransform: 'capitalize' }}>{ex.name}</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#666' }}>
              Meta: {ex.target_sets} séries × {ex.target_reps} reps | Descanso: {ex.rest_seconds}s
            </p>

            {/* Tabela de Séries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logData[ex.exercise_id]?.map((set, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #eee' }}>
                  <span style={{ fontWeight: 'bold', width: '65px', fontSize: '0.9rem' }}>Série {idx + 1}</span>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    Carga (kg):
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => handleInputChange(ex.exercise_id, idx, 'weight', Number(e.target.value))}
                      style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    Reps:
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => handleInputChange(ex.exercise_id, idx, 'reps', Number(e.target.value))}
                      style={{ width: '50px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleFinishWorkout}
        disabled={saving}
        style={{
          marginTop: '28px',
          width: '100%',
          padding: '14px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          backgroundColor: saving ? '#888' : '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? 'Gravando no Neon...' : 'Concluir e Salvar Treino'}
      </button>

    </div>
  );
}