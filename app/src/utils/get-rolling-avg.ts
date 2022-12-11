export function getRollingAvger(newValueWeight: number) {
  return (avg: number, newValue: number) => avg * (1 - newValueWeight) + newValueWeight * newValue;
}
