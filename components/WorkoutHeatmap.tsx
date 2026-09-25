// components/WorkoutHeatmap.tsx
'use client';

import { useMemo } from 'react';

interface WorkoutHeatmapProps {
  trainedDates: string[];
}

export default function WorkoutHeatmap({ trainedDates }: WorkoutHeatmapProps) {
  const days = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const trained = trainedDates.includes(iso);
      list.push({
        date: iso,
        trained,
        dayOfWeek: d.getDay(),
        dayNum: d.getDate(),
      });
    }
    return list;
  }, [trainedDates]);

  const totalTrained = days.filter((d) => d.trained).length;

  return (
    <div
      style={{
        backgroundColor: '#1b2d2a',
        borderRadius: '16px',
        padding: '20px',
        color: '#fff',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              backgroundColor: 'rgba(46, 213, 115, 0.2)',
              color: '#2ed573',
              padding: '8px',
              borderRadius: '10px',
              fontSize: '1.2rem',
            }}
          >
            🏃
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Treinar</h3>
            <span style={{ fontSize: '0.85rem', color: '#a4b0be' }}>
              {totalTrained} dias concluídos nos últimos 60 dias
            </span>
          </div>
        </div>

        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: totalTrained > 0 ? '#2ed573' : '#2f3542',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#1e272e',
          }}
        >
          ✓
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(7, 14px)',
          gap: '4px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.trained ? 'Treino Realizado' : 'Descanso'}`}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '3px',
              backgroundColor: day.trained ? '#2ed573' : 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          fontSize: '0.75rem',
          color: '#747d8c',
        }}
      >
        <span>60 dias atrás</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Descanso</span>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px' }} />
          <div style={{ width: '10px', height: '10px', backgroundColor: '#2ed573', borderRadius: '2px' }} />
          <span>Treinado</span>
        </div>
        <span>Hoje</span>
      </div>
    </div>
  );
}