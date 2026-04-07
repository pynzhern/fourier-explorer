export interface SineComponent {
  frequency: number;  // integer Hz
  amplitude: number;  // 0-2
  phase: number;      // 0 to 2*PI
  enabled: boolean;
}

export interface DFTResult {
  real: number[];      // cosine coefficients
  imag: number[];      // sine coefficients
  magnitude: number[];
  phase: number[];
}

/**
 * Generate a discrete signal from a sum of sine components.
 * signal[n] = sum( A_i * sin(2*pi*f_i*n/N + phi_i) )
 */
export function generateSignal(
  components: SineComponent[],
  N: number,
): number[] {
  const signal = new Array(N).fill(0);
  for (const comp of components) {
    if (!comp.enabled) continue;
    for (let n = 0; n < N; n++) {
      signal[n] +=
        comp.amplitude *
        Math.sin((2 * Math.PI * comp.frequency * n) / N + comp.phase);
    }
  }
  return signal;
}

/**
 * Naive DFT: O(N^2) implementation using dot products.
 * X[k] = sum_{n=0}^{N-1} x[n] * e^{-j*2*pi*k*n/N}
 *       = sum x[n]*cos(2*pi*k*n/N) - j * sum x[n]*sin(2*pi*k*n/N)
 *
 * The real part is the dot product of the signal with cos basis.
 * The imaginary part is the negative dot product with sin basis.
 */
export function computeDFT(signal: number[]): DFTResult {
  const N = signal.length;
  const real = new Array(N).fill(0);
  const imag = new Array(N).fill(0);
  const magnitude = new Array(N).fill(0);
  const phase = new Array(N).fill(0);

  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += signal[n] * Math.cos(angle);
      im -= signal[n] * Math.sin(angle);
    }
    real[k] = re;
    imag[k] = im;
    magnitude[k] = Math.sqrt(re * re + im * im);
    phase[k] = Math.atan2(im, re);
  }

  return { real, imag, magnitude, phase };
}

/**
 * Compute the dot product of the signal with a single cosine basis vector at frequency k.
 * Returns: the element-wise products and the sum (the dot product).
 */
export function dotProductWithCos(
  signal: number[],
  k: number,
): { basis: number[]; products: number[]; dotProduct: number } {
  const N = signal.length;
  const basis = new Array(N);
  const products = new Array(N);
  let dotProduct = 0;

  for (let n = 0; n < N; n++) {
    basis[n] = Math.cos((2 * Math.PI * k * n) / N);
    products[n] = signal[n] * basis[n];
    dotProduct += products[n];
  }

  return { basis, products, dotProduct };
}

/**
 * Compute the dot product of the signal with a single sine basis vector at frequency k.
 * Returns: the element-wise products and the sum.
 */
export function dotProductWithSin(
  signal: number[],
  k: number,
): { basis: number[]; products: number[]; dotProduct: number } {
  const N = signal.length;
  const basis = new Array(N);
  const products = new Array(N);
  let dotProduct = 0;

  for (let n = 0; n < N; n++) {
    basis[n] = Math.sin((2 * Math.PI * k * n) / N);
    products[n] = signal[n] * basis[n];
    dotProduct += products[n];
  }

  return { basis, products, dotProduct };
}

/**
 * Reconstruct a signal from DFT coefficients using the first K frequency bins.
 * Accounts for conjugate symmetry: each bin k (except DC and Nyquist) has a
 * mirror at N-k that contributes equally, so we multiply by 2.
 */
export function reconstructSignal(
  dftResult: DFTResult,
  K: number,
  N: number,
): number[] {
  const signal = new Array(N).fill(0);
  const maxK = Math.min(K, N);

  for (let n = 0; n < N; n++) {
    let val = 0;
    for (let k = 0; k < maxK; k++) {
      const angle = (2 * Math.PI * k * n) / N;
      const factor = (k === 0 || k === N / 2) ? 1 : 2;
      val += factor * (dftResult.real[k] * Math.cos(angle) - dftResult.imag[k] * Math.sin(angle));
    }
    signal[n] = val / N;
  }

  return signal;
}

/**
 * normalise magnitude spectrum for display (divide by N/2, except DC which divides by N).
 */
export function normaliseMagnitude(magnitude: number[], N: number): number[] {
  return magnitude.map((m, k) => (k === 0 ? m / N : (2 * m) / N));
}
