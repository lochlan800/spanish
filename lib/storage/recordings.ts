import { Recording } from '@/types';
import { addRecording as dbAddRecording, getRecordings as dbGetRecordings, getRecording as dbGetRecording, deleteRecording as dbDeleteRecording } from '@/lib/db/indexdb';
import { v4 as uuidv4 } from 'uuid';

export async function createRecording(
  file: File
): Promise<Recording> {
  const arrayBuffer = await file.arrayBuffer();
  const audioUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: file.type }));

  const audio = new Audio();
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

  const recording: Recording = {
    id: uuidv4(),
    filename: file.name,
    uploadedAt: Date.now(),
    audioUrl,
    metadata: {
      duration,
      format: file.type,
      sampleRate: 0,
    },
  };

  await dbAddRecording(recording);
  return recording;
}

export async function getAllRecordings(): Promise<Recording[]> {
  return dbGetRecordings();
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  return dbGetRecording(id);
}

export async function removeRecording(id: string): Promise<void> {
  return dbDeleteRecording(id);
}
