export function withInterval(callback: (interval: number) => any) {
  let lastTimestamp = 0;

  return () => {
    if (lastTimestamp === 0) return (lastTimestamp = performance.now());

    const now = performance.now();
    const interval = now - lastTimestamp;
    lastTimestamp = now;
    callback(interval);
  };
}
