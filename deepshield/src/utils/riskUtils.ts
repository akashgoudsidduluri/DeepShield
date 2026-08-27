export function getRiskColorText(score: number): string {
  if (score <= 30) return 'text-safe';
  if (score <= 60) return 'text-warning';
  return 'text-danger';
}

export function getRiskColorBg(score: number): string {
  if (score <= 30) return 'bg-safe';
  if (score <= 60) return 'bg-warning';
  return 'bg-danger';
}

export function getRiskColorBorder(score: number): string {
  if (score <= 30) return 'border-safe';
  if (score <= 60) return 'border-warning';
  return 'border-danger';
}

export function getRiskSummary(score: number): string {
  if (score <= 30) return 'No strong indicators of AI manipulation were detected.';
  if (score <= 60) return 'Some characteristics warrant additional verification.';
  return 'Multiple analysis signals indicate a higher likelihood of AI-generated or manipulated content.';
}
