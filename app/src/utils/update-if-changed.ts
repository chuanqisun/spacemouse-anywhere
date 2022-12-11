export function updateIfChanged<T, K extends keyof T>(obj: T, field: K, value: T[K]) {
  if (obj[field] !== value) {
    obj[field] = value;
  }
}
