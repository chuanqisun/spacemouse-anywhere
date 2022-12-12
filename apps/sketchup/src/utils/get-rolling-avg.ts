export function getRollingAverager(newValueWeight: number) {
  let avg = 0;

  return {
    next: (newValue: number) => (avg = (1 - newValueWeight) * avg + newValueWeight * newValue),
    value: () => avg,
  };
}
