import { Recording } from '@/types';
import { addRecording as dbAddRecording, getRecordings as dbGetRecordings, getRecording as dbGetRecording, deleteRecording as dbDeleteRecording } from '@/lib/db/indexdb';
import { v4 as uuidv4 } from 'uuid';

export async function createRecording(
  file: File
): Promise<Recording> {
  const arrayBuffer = await file.arrayBuffer();
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

  const recording: Recording = {
    id: uuidv4(),
    filename: file.name,
    uploadedAt: Date.now(),
    audioBlob,
    metadata: {
      duration,
      format: file.type,
      sampleRate: 0,
    },
  };

  await dbAddRecording(recording);

  return {
    ...recording,
    audioUrl: URL.createObjectURL(audioBlob),
  };
}

export async function getAllRecordings(): Promise<Recording[]> {
  const recordings = await dbGetRecordings();
  return recordings.map((rec) => {
    const audioUrl = rec.audioBlob ? URL.createObjectURL(rec.audioBlob) : rec.audioUrl || '';
    return {
      ...rec,
      audioUrl,
    };
  });
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  const recording = await dbGetRecording(id);
  if (!recording) return undefined;

  const audioUrl = recording.audioBlob ? URL.createObjectURL(recording.audioBlob) : recording.audioUrl || '';
  return {
    ...recording,
    audioUrl,
  };
}

export async function removeRecording(id: string): Promise<void> {
  return dbDeleteRecording(id);
}
