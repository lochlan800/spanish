import { Card } from '@/types';
import { addCard as dbAddCard, getCards as dbGetCards, getCardsByRecording as dbGetCardsByRecording, getCard as dbGetCard, updateCard as dbUpdateCard, deleteCard as dbDeleteCard, getCardsDue as dbGetCardsDue } from '@/lib/db/indexdb';
import { getNewCard, scheduleCard as scheduleCardSM2 } from '@/lib/spaced-repetition/sm2';
import { v4 as uuidv4 } from 'uuid';

export async function createCard(
  recordingId: string,
  english: string,
  spanish: string,
  audioStartTime: number,
  audioEndTime: number
): Promise<Card> {
  const newCardDefaults = getNewCard();

  const card: Card = {
    id: uuidv4(),
    recordingId,
    english,
    spanish,
    audioStartTime,
    audioEndTime,
    interval: newCardDefaults.interval || 1,
    easeFactor: newCardDefaults.easeFactor || 2.5,
    repetitions: newCardDefaults.repetitions || 0,
    nextReviewDate: newCardDefaults.nextReviewDate || Date.now(),
    lastReviewDate: newCardDefaults.lastReviewDate || null,
    difficulty: newCardDefaults.difficulty || 'new',
    lastScore: newCardDefaults.lastScore || null,
    totalReviews: newCardDefaults.totalReviews || 0,
    correctReviews: newCardDefaults.correctReviews || 0,
    createdAt: newCardDefaults.createdAt || Date.now(),
  };

  await dbAddCard(card);
  return card;
}

export async function getAllCards(): Promise<Card[]> {
  return dbGetCards();
}

export async function getCardsByRecording(recordingId: string): Promise<Card[]> {
  return dbGetCardsByRecording(recordingId);
}

export async function getCard(id: string): Promise<Card | undefined> {
  return dbGetCard(id);
}

export async function updateCard(card: Card): Promise<void> {
  return dbUpdateCard(card);
}

export async function deleteCard(id: string): Promise<void> {
  return dbDeleteCard(id);
}

export async function getDueCards(): Promise<Card[]> {
  return dbGetCardsDue();
}

export async function reviewCard(cardId: string, quality: number): Promise<Card> {
  const card = await getCard(cardId);
  if (!card) throw new Error(`Card ${cardId} not found`);

  const updatedCard = scheduleCardSM2(card, quality);
  await updateCard(updatedCard);
  return updatedCard;
}
