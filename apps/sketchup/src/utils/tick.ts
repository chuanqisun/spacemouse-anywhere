export function tick(task: () => any) {
  task();
  window.requestAnimationFrame(() => tick(task));
}
