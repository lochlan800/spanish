import { Mix } from '@/types';
import { addMix as dbAddMix, getMixes as dbGetMixes, getMix as dbGetMix, updateMix as dbUpdateMix, deleteMix as dbDeleteMix, getRecordingsByMix as dbGetRecordingsByMix, getCardsByMix as dbGetCardsByMix } from '@/lib/db/indexdb';
import { v4 as uuidv4 } from 'uuid';

export async function createMix(name: string): Promise<Mix> {
  const mix: Mix = {
    id: uuidv4(),
    name,
    createdAt: Date.now(),
  };

  await dbAddMix(mix);
  return mix;
}

export async function getAllMixes(): Promise<Mix[]> {
  return dbGetMixes();
}

export async function getMix(id: string): Promise<Mix | undefined> {
  return dbGetMix(id);
}

export async function updateMixName(id: string, name: string): Promise<void> {
  const mix = await getMix(id);
  if (!mix) throw new Error(`Mix ${id} not found`);

  await dbUpdateMix({ ...mix, name });
}

export async function deleteMix(id: string): Promise<void> {
  return dbDeleteMix(id);
}

export async function getRecordingsInMix(mixId: string) {
  return dbGetRecordingsByMix(mixId);
}

export async function getCardsInMix(mixId: string) {
  return dbGetCardsByMix(mixId);
}
