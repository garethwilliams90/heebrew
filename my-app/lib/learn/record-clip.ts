const TARGET_RATE = 16000;

function pickRecorderMime() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function audioContext() {
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    throw new Error("audio");
  }
  return new Ctor();
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export function encodeWavPcm16(samples: Float32Array, sampleRate = TARGET_RATE) {
  const bytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + bytes);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + bytes, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, bytes, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function resampleMono(buffer: AudioBuffer, sampleRate: number) {
  const frames = Math.max(1, Math.round(buffer.duration * sampleRate));
  const output = new Float32Array(frames);
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null;
  const step = buffer.sampleRate / sampleRate;

  for (let index = 0; index < frames; index += 1) {
    const source = index * step;
    const first = Math.min(left.length - 1, Math.floor(source));
    const next = Math.min(left.length - 1, first + 1);
    const frac = source - first;
    let sample = (left[first] ?? 0) * (1 - frac) + (left[next] ?? 0) * frac;
    if (right) {
      sample = (sample + (right[first] ?? 0) * (1 - frac) + (right[next] ?? 0) * frac) / 2;
    }
    output[index] = sample;
  }

  return output;
}

function concatFloat32(chunks: Float32Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function resampleSamples(samples: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) {
    return samples;
  }
  const frames = Math.max(1, Math.round((samples.length / fromRate) * toRate));
  const output = new Float32Array(frames);
  const step = fromRate / toRate;
  for (let index = 0; index < frames; index += 1) {
    const source = index * step;
    const first = Math.min(samples.length - 1, Math.floor(source));
    const next = Math.min(samples.length - 1, first + 1);
    const frac = source - first;
    output[index] = (samples[first] ?? 0) * (1 - frac) + (samples[next] ?? 0) * frac;
  }
  return output;
}

async function wavFromBlob(blob: Blob) {
  const context = audioContext();
  try {
    const bytes = await blob.arrayBuffer();
    const buffer = await context.decodeAudioData(bytes.slice(0));
    return encodeWavPcm16(resampleMono(buffer, TARGET_RATE), TARGET_RATE);
  } finally {
    await context.close();
  }
}

function wait(durationMs: number, live: () => boolean) {
  return new Promise<void>((resolve) => {
    const started = performance.now();
    const tick = () => {
      if (!live() || performance.now() - started >= durationMs) {
        resolve();
        return;
      }
      window.setTimeout(tick, 50);
    };
    window.setTimeout(tick, Math.min(50, durationMs));
  });
}

type PcmTap = {
  samples: () => Float32Array;
  stop: () => Promise<void>;
};

function tapPcm(stream: MediaStream) {
  const context = audioContext();
  const chunks: Float32Array[] = [];
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const mute = context.createGain();
  mute.gain.value = 0;
  processor.onaudioprocess = (event) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(mute);
  mute.connect(context.destination);
  const tap: PcmTap = {
    samples: () => resampleSamples(concatFloat32(chunks), context.sampleRate, TARGET_RATE),
    stop: async () => {
      source.disconnect();
      processor.disconnect();
      mute.disconnect();
      await context.close();
    },
  };
  return { tap, ready: context.resume() };
}

export async function recordWavClip(stream: MediaStream, durationMs: number, live: () => boolean) {
  const mime = pickRecorderMime();
  const pcm = tapPcm(stream);
  await pcm.ready;

  let recorder: MediaRecorder | null = null;
  const chunks: BlobPart[] = [];
  if (typeof MediaRecorder !== "undefined") {
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.start();
    } catch {
      recorder = null;
    }
  }

  await wait(durationMs, live);

  const blob = await new Promise<Blob | null>((resolve) => {
    if (!recorder || recorder.state === "inactive") {
      resolve(chunks.length > 0 ? new Blob(chunks, { type: recorder?.mimeType || mime }) : null);
      return;
    }
    recorder.onstop = () => {
      resolve(chunks.length > 0 ? new Blob(chunks, { type: recorder?.mimeType || mime }) : null);
    };
    try {
      recorder.stop();
    } catch {
      resolve(null);
    }
  });

  const samples = pcm.tap.samples();
  await pcm.tap.stop();

  if (!live()) {
    return null;
  }

  if (blob && blob.size >= 64) {
    try {
      return await wavFromBlob(blob);
    } catch {
      // Fall through to the PCM tap collected from the same take.
    }
  }

  if (samples.length === 0) {
    return null;
  }
  return encodeWavPcm16(samples, TARGET_RATE);
}

export function wavBlob(bytes: ArrayBuffer) {
  return new Blob([bytes], { type: "audio/wav" });
}
