/**
 * Track metadata shared by the card grid, modal, concept map and stats bar.
 */

export const tracks = [
  { id: 'fundamentals', label: 'Core Definitions', icon: '🌱', color: 'var(--color-track-fundamentals)' },
  { id: 'data-eng', label: 'Data Engineering', icon: '📊', color: 'var(--color-track-de)' },
  { id: 'ml-core', label: 'Core ML Theory', icon: '🧠', color: 'var(--color-track-ml-core)' },
  { id: 'ml-models', label: 'ML Models', icon: '🤖', color: 'var(--color-track-models)' },
  { id: 'deep-learning', label: 'Deep Learning', icon: '⚡', color: 'var(--color-track-dl)' },
  { id: 'mlops', label: 'MLOps & Production', icon: '🚀', color: 'var(--color-track-mlops)' }
];

export const trackById = Object.fromEntries(tracks.map(t => [t.id, t]));
