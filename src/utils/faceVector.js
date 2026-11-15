/**
 * Generates a standard normalized 128-dimensional embedding vector from
 * image canvas pixels or user facial biometric snapshot.
 */
export function generateFaceEmbeddingFromCanvas(canvas, seed = null) {
  const DIM = 128;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Use pixel color histograms and sample luminance to generate a deterministic feature vector
  const bucketSize = Math.floor(data.length / (DIM * 4));
  const rawVector = new Float32Array(DIM);

  let seedOffset = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      seedOffset = (seedOffset + seed.charCodeAt(i) * 17) % 1000;
    }
  }

  for (let i = 0; i < DIM; i++) {
    let sum = 0;
    const start = i * bucketSize * 4;
    const end = Math.min(start + bucketSize * 4, data.length);
    let count = 0;
    for (let j = start; j < end; j += 4) {
      // standard luminance formula: 0.299*R + 0.587*G + 0.114*B
      const lum = (0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2]) / 255;
      sum += lum;
      count++;
    }
    const avgLum = count > 0 ? sum / count : 0.5;
    // Map to [-1, 1] range
    rawVector[i] = (avgLum - 0.5) * 2 + (seedOffset ? (Math.sin(seedOffset + i) * 0.1) : 0);
  }

  // L2 Normalize the vector so norm = 1.0
  let norm = 0;
  for (let i = 0; i < DIM; i++) {
    norm += rawVector[i] * rawVector[i];
  }
  norm = Math.sqrt(norm) || 1.0;

  const normalized = [];
  for (let i = 0; i < DIM; i++) {
    // Round to 5 decimal places
    normalized.push(parseFloat((rawVector[i] / norm).toFixed(5)));
  }

  return normalized;
}

/**
 * Fallback generator for testing when camera is unavailable
 */
export function generateDeterministicVector(seedString, dim = 128) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(hash + i * 13.37);
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map(v => parseFloat((v / norm).toFixed(5)));
}
