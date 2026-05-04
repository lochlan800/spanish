import { Card, UserStats } from '@/types';
import { getUserStats as dbGetUserStats, updateUserStats as dbUpdateUserStats } from '@/lib/db/indexdb';
import { getAllCards } from './cards';

export async function calculateUserStats(): Promise<UserStats> {
  const allCards = await getAllCards();
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const cardsLearned = allCards.filter((c) => c.difficulty === 'graduated').length;
  const cardsReviewing = allCards.filter((c) => c.difficulty === 'review').length;
  const totalReviews = allCards.reduce((sum, c) => sum + c.totalReviews, 0);

  let currentStreak = 0;
  const lastActivityCard = allCards
    .filter((c) => c.lastReviewDate !== null)
    .sort((a, b) => (b.lastReviewDate || 0) - (a.lastReviewDate || 0))[0];

  if (lastActivityCard && lastActivityCard.lastReviewDate) {
    const daysSinceLastReview = Math.floor((now - lastActivityCard.lastReviewDate) / oneDay);
    if (daysSinceLastReview === 0) {
      currentStreak = calculateStreak(allCards);
    } else if (daysSinceLastReview === 1) {
      currentStreak = calculateStreak(allCards);
    }
  }

  const stats: UserStats = {
    totalCards: allCards.length,
    cardsLearned,
    cardsReviewing,
    totalReviews,
    currentStreak,
    lastActivityDate: lastActivityCard?.lastReviewDate || null,
  };

  return stats;
}

export async function getUserStats(): Promise<UserStats> {
  return calculateUserStats();
}

export async function updateStats(): Promise<UserStats> {
  const stats = await calculateUserStats();
  await dbUpdateUserStats(stats);
  return stats;
}

function calculateStreak(cards: Card[]): number {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  let streak = 0;
  let currentDate = new Date(now);
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dayStart = currentDate.getTime();
    const dayEnd = dayStart + oneDay;

    const hasActivityToday = cards.some(
      (c) => c.lastReviewDate && c.lastReviewDate >= dayStart && c.lastReviewDate < dayEnd
    );

    if (hasActivityToday) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getAccuracy(): Promise<number> {
  const allCards = await getAllCards();
  const totalReviews = allCards.reduce((sum, c) => sum + c.totalReviews, 0);
  const correctReviews = allCards.reduce((sum, c) => sum + c.correctReviews, 0);

  if (totalReviews === 0) return 0;
  return (correctReviews / totalReviews) * 100;
}
