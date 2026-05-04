import { Card } from '@/types';

const MIN_EASE = 1.3;
const INITIAL_INTERVAL = 1;
const INITIAL_EASE = 2.5;

export interface ReviewResult {
  quality: number;
  nextReviewDate: number;
  newInterval: number;
  newEaseFactor: number;
  newDifficulty: Card['difficulty'];
}

export function calculateSM2(
  currentCard: Card,
  quality: number
): ReviewResult {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  let { easeFactor, interval, repetitions } = currentCard;

  const newEaseFactor = Math.max(
    MIN_EASE,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  let newInterval: number;
  let newDifficulty: Card['difficulty'];

  if (quality < 3) {
    newInterval = INITIAL_INTERVAL;
    newDifficulty = 'learning';
  } else {
    newDifficulty = quality === 5 ? 'graduated' : 'review';

    if (repetitions === 0) {
      newInterval = INITIAL_INTERVAL;
    } else if (repetitions === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  const nextReviewDate = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return {
    quality,
    nextReviewDate,
    newInterval,
    newEaseFactor,
    newDifficulty,
  };
}

export function scheduleCard(card: Card, quality: number): Card {
  const result = calculateSM2(card, quality);

  return {
    ...card,
    easeFactor: result.newEaseFactor,
    interval: result.newInterval,
    repetitions: card.repetitions + 1,
    nextReviewDate: result.nextReviewDate,
    lastReviewDate: Date.now(),
    lastScore: quality,
    difficulty: result.newDifficulty,
    totalReviews: card.totalReviews + 1,
    correctReviews: quality >= 3 ? card.correctReviews + 1 : card.correctReviews,
  };
}

export function getNewCard(): Partial<Card> {
  const now = Date.now();
  return {
    interval: INITIAL_INTERVAL,
    easeFactor: INITIAL_EASE,
    repetitions: 0,
    nextReviewDate: now,
    lastReviewDate: null,
    difficulty: 'new',
    lastScore: null,
    totalReviews: 0,
    correctReviews: 0,
    createdAt: now,
  };
}

export function getAccuracy(card: Card): number {
  if (card.totalReviews === 0) return 0;
  return (card.correctReviews / card.totalReviews) * 100;
}
