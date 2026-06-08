export function calculateKgCo2e(quantity: number, kgCo2ePerUnit: number) {
  return roundCarbon(quantity * kgCo2ePerUnit);
}

export function roundCarbon(value: number) {
  return Math.round(value * 100) / 100;
}

export function percentChange(current: number, baseline: number) {
  if (baseline === 0) return 0;
  return Math.round(((current - baseline) / baseline) * 1000) / 10;
}

