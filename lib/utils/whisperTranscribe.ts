'use client';

import { pipeline, env } from '@huggingface/transformers';

// Allow remote model downloads from HuggingFace
env.allowLocalModels = false;
env.allowRemoteModels = true;

const WHISPER_MODEL = 'Xenova/whisper-tiny';
const WHISPER_SAMPLE_RATE = 16000;

export type ProgressCallback = (info: {
  status: string;
  progress?: number;
  file?: string;
}) => void;

let pipelinePromise: Promise<any> | null = null;

async function getPipeline(onProgress?: ProgressCallback) {
  if (!pipelinePromise) {
    pipelinePromise = pipeline('automatic-speech-recognition', WHISPER_MODEL, {
      progress_callback: onProgress,
      dtype: 'q8',
    } as any);
  }
  return pipelinePromise;
}

async function decodeAudioSegment(
  audioUrl: string,
  startTime: number,
  endTime: number
): Promise<Float32Array> {
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();

  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass({ sampleRate: WHISPER_SAMPLE_RATE });

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const startSample = Math.floor(startTime * audioBuffer.sampleRate);
  const endSampleRaw = Math.floor(endTime * audioBuffer.sampleRate);
  const endSample = Math.min(endSampleRaw, audioBuffer.length);

  if (endSample <= startSample) {
    audioContext.close();
    throw new Error('End time must be after start time');
  }

  const segmentLength = endSample - startSample;
  const numChannels = audioBuffer.numberOfChannels;
  const mono = new Float32Array(segmentLength);

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < segmentLength; i++) {
      mono[i] += channelData[startSample + i] / numChannels;
    }
  }

  audioContext.close();

  if (audioBuffer.sampleRate === WHISPER_SAMPLE_RATE) {
    return mono;
  }

  return resampleLinear(mono, audioBuffer.sampleRate, WHISPER_SAMPLE_RATE);
}

function resampleLinear(
  input: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLength = Math.floor(input.length / ratio);
  const output = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcPos = i * ratio;
    const srcIdx = Math.floor(srcPos);
    const frac = srcPos - srcIdx;
    const a = input[srcIdx] || 0;
    const b = input[Math.min(srcIdx + 1, input.length - 1)] || 0;
    output[i] = a + (b - a) * frac;
  }

  return output;
}

export interface TranscribeOptions {
  language?: 'english' | 'spanish' | null;
  onProgress?: ProgressCallback;
}

export interface TranscribeResult {
  text: string;
  language?: 'english' | 'spanish' | null;
}

export async function transcribeAudioSegment(
  audioUrl: string,
  startTime: number,
  endTime: number,
  options: TranscribeOptions = {}
): Promise<TranscribeResult> {
  const { language = null, onProgress } = options;

  const transcriber = await getPipeline(onProgress);

  const audioData = await decodeAudioSegment(audioUrl, startTime, endTime);

  const result = await transcriber(audioData, {
    language: language || undefined,
    task: 'transcribe',
    return_timestamps: false,
  });

  const text = Array.isArray(result)
    ? result.map((r: any) => r.text).join(' ')
    : result.text;

  return {
    text: (text || '').trim(),
    language,
  };
}
