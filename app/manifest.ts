// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gym AI Coach',
    short_name: 'GymCoach',
    description: 'Seu personal trainer inteligente com progressão comprovada',
    start_url: '/',
    display: 'standalone',
    background_color: '#121418',
    theme_color: '#121418',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}