import { Recording } from '@/types';
import { addRecording as dbAddRecording, getRecordings as dbGetRecordings, getRecording as dbGetRecording, deleteRecording as dbDeleteRecording } from '@/lib/db/indexdb';
import { v4 as uuidv4 } from 'uuid';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

export async function createRecording(
  file: File
): Promise<Recording> {
  const arrayBuffer = await file.arrayBuffer();
  const audioBase64 = arrayBufferToBase64(arrayBuffer);
  const audioBlob = new Blob([arrayBuffer], { type: file.type });

  const audio = new Audio();
  const audioUrl = URL.createObjectURL(audioBlob);

  const durationPromise = new Promise<number>((resolve) => {
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      resolve(0);
    };
    audio.src = audioUrl;
  });

  const duration = await durationPromise;

  const recording: Recording & { audioBase64?: string } = {
    id: uuidv4(),
    filename: file.name,
    uploadedAt: Date.now(),
    audioBase64,
    metadata: {
      duration,
      format: file.type,
      sampleRate: 0,
    },
  };

  await dbAddRecording(recording as Recording);

  return {
    ...recording,
    audioUrl: URL.createObjectURL(audioBlob),
  } as Recording;
}

export async function getAllRecordings(): Promise<Recording[]> {
  const recordings = await dbGetRecordings();
  return recordings.map((rec: any) => {
    let audioUrl = '';
    if (rec.audioBase64) {
      const blob = base64ToBlob(rec.audioBase64, rec.metadata.format);
      audioUrl = URL.createObjectURL(blob);
    } else if (rec.audioUrl) {
      audioUrl = rec.audioUrl;
    }
    return {
      ...rec,
      audioUrl,
    };
  });
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  const recording: any = await dbGetRecording(id);
  if (!recording) return undefined;

  let audioUrl = '';
  if (recording.audioBase64) {
    const blob = base64ToBlob(recording.audioBase64, recording.metadata.format);
    audioUrl = URL.createObjectURL(blob);
  } else if (recording.audioUrl) {
    audioUrl = recording.audioUrl;
  }

  return {
    ...recording,
    audioUrl,
  };
}

export async function removeRecording(id: string): Promise<void> {
  return dbDeleteRecording(id);
}
