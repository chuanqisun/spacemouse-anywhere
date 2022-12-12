export const tap =
  (fn: Function) =>
  <T = any>(v: T) => {
    fn(v);
    return v;
  };
