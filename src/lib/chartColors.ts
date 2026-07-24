import type { Decision } from '@/types/transaction'

// Paleta desaturada y de bajo contraste para gráficos y badges del dashboard.
export const CHART_COLOR_VALID = '#0f766e' // teal-700
export const CHART_COLOR_FRAUD = '#9f1239' // rose-800
export const CHART_COLOR_UNASSIGNED = '#475569' // slate-600

export const BADGE_BY_DECISION: Record<Decision, string> = {
  GREEN: 'bg-teal-50 text-teal-800',
  YELLOW: 'bg-amber-50 text-amber-800',
  RED: 'bg-rose-50 text-rose-800',
  BLUE: 'bg-slate-100 text-slate-700',
}

// La app corre siempre en tema oscuro (ver index.html), así que los textos y
// grillas de Chart.js (que pintan sobre canvas, no siguen los tokens CSS) se
// fijan en tonos claros legibles sobre fondo oscuro.
export const CHART_TEXT_COLOR = '#cbd5e1' // slate-300
export const CHART_GRID_COLOR = 'rgba(255, 255, 255, 0.1)'
