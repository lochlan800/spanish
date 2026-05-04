'use client';

import { useEffect, useState } from 'react';
import { getAllCards } from '@/lib/storage/cards';
import { getUserStats, getAccuracy } from '@/lib/storage/progress';
import { Card, UserStats } from '@/types';

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats();
        setStats(userStats);

        const allCards = await getAllCards();
        setCards(allCards);

        const acc = await getAccuracy();
        setAccuracy(acc);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const cardsNew = cards.filter((c) => c.difficulty === 'new').length;
  const cardsLearning = cards.filter((c) => c.difficulty === 'learning').length;
  const cardsReview = cards.filter((c) => c.difficulty === 'review').length;
  const cardsGraduated = cards.filter((c) => c.difficulty === 'graduated').length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Learning Statistics</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Overall Accuracy</div>
          <div className="mt-2 text-4xl font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Total Reviews</div>
          <div className="mt-2 text-4xl font-bold text-green-600">{stats?.totalReviews || 0}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Learning Streak</div>
          <div className="mt-2 text-4xl font-bold text-orange-600">
            {stats?.currentStreak || 0} days
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-2xl font-bold">Card Distribution</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-gray-600">New</p>
            <p className="text-2xl font-bold text-red-600">{cardsNew}</p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-gray-600">Learning</p>
            <p className="text-2xl font-bold text-yellow-600">{cardsLearning}</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Reviewing</p>
            <p className="text-2xl font-bold text-blue-600">{cardsReview}</p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-600">Graduated</p>
            <p className="text-2xl font-bold text-green-600">{cardsGraduated}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-2xl font-bold">Card Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-300 bg-gray-50">
              <tr>
                <th className="px-4 py-2">English</th>
                <th className="px-4 py-2">Spanish</th>
                <th className="px-4 py-2">Difficulty</th>
                <th className="px-4 py-2">Reviews</th>
                <th className="px-4 py-2">Accuracy</th>
                <th className="px-4 py-2">Ease</th>
              </tr>
            </thead>
            <tbody>
              {cards.slice(0, 10).map((card) => (
                <tr key={card.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 max-w-xs truncate">{card.english}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{card.spanish}</td>
                  <td className="px-4 py-2">{card.difficulty}</td>
                  <td className="px-4 py-2">{card.totalReviews}</td>
                  <td className="px-4 py-2">
                    {card.totalReviews === 0
                      ? '-'
                      : `${Math.round((card.correctReviews / card.totalReviews) * 100)}%`}
                  </td>
                  <td className="px-4 py-2">{card.easeFactor.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cards.length > 10 && (
          <p className="mt-4 text-sm text-gray-600">
            Showing 10 of {cards.length} cards
          </p>
        )}
      </div>
    </div>
  );
}
