export const repeatSync = <T>(times: number, fn: () => T) => {
  return Array.from({ length: times }, fn);
};
