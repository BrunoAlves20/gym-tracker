// components/ExerciseImage.tsx
'use client';

import { useState } from 'react';

interface ExerciseImageProps {
  url?: string;
  name: string;
}

export default function ExerciseImage({ url, name }: ExerciseImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!url || error) {
    return (
      <div
        style={{
          width: '90px',
          height: '90px',
          borderRadius: '12px',
          backgroundColor: '#262a34',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6a4df4',
          fontSize: '0.75rem',
          textAlign: 'center',
          padding: '6px',
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>🏋️</span>
        <span style={{ marginTop: '4px', color: '#a4b0be' }}>Sem prévia</span>
      </div>
    );
  }

  // Encaminha através do proxy interno para contornar restrições de cabeçalhos
  const proxiedSrc = `/api/exercise-media?url=${encodeURIComponent(url)}`;

  return (
    <div style={{ position: 'relative', width: '90px', height: '90px' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            backgroundColor: '#1f222a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: '#888',
          }}
        >
          A carregar...
        </div>
      )}
      <img
        src={proxiedSrc}
        alt={name}
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{
          width: '90px',
          height: '90px',
          objectFit: 'cover',
          borderRadius: '12px',
          backgroundColor: '#fff',
          border: '2px solid #35383f',
          display: loading ? 'none' : 'block',
        }}
      />
    </div>
  );
}