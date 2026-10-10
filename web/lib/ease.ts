export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);

export const easeInOutCubic = (t: number): number => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Frame-rate independent exponential smoothing factor. */
export const damp = (dt: number, rate: number): number => 1 - Math.exp(-dt * rate);
