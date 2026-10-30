/** First and last moment in a recording that is loud enough to be speech. */
export function speechBounds(samples: Float32Array, sampleRate: number) {
  const windowSize = Math.max(1, Math.floor(sampleRate * 0.03));
  const threshold = 0.02;
  let startSample = 0;
  let endSample = samples.length;
  let heard = false;
  for (let index = 0; index + windowSize <= samples.length; index += windowSize) {
    let sum = 0;
    for (let offset = 0; offset < windowSize; offset += 1) {
      const sample = samples[index + offset] ?? 0;
      sum += sample * sample;
    }
    if (Math.sqrt(sum / windowSize) < threshold) {
      continue;
    }
    if (!heard) {
      startSample = index;
      heard = true;
    }
    endSample = index + windowSize;
  }
  const endMs = Math.round((samples.length / sampleRate) * 1000);
  if (!heard) {
    return { startMs: 0, endMs };
  }
  const startMs = Math.round((startSample / sampleRate) * 1000);
  return { startMs, endMs: Math.max(Math.round((endSample / sampleRate) * 1000), startMs + 1) };
}
