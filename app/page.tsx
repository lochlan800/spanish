'use client';

import { useEffect, useState } from 'react';
import { useRecordings } from '@/lib/hooks/useRecordings';
import { getAllCards } from '@/lib/storage/cards';
import { getUserStats } from '@/lib/storage/progress';
import { UserStats, Card } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const { recordings, isLoading: recordingsLoading } = useRecordings();
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allCards = await getAllCards();
        setCards(allCards);

        const now = Date.now();
        const due = allCards.filter((c) => c.nextReviewDate <= now);
        setDueCount(due.length);

        const userStats = await getUserStats();
        setStats(userStats);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to Spanish Learner</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Total Cards</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.totalCards || 0}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Cards Due Today</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{dueCount}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Total Reviews</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.totalReviews || 0}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-600">Current Streak</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {stats?.currentStreak || 0} days
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Recent Recordings</h2>
          {recordingsLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
              Loading...
            </div>
          ) : recordings.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-gray-600">No recordings yet</p>
              <Link href="/upload" className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                Upload your first recording
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.slice(-5).reverse().map((rec) => (
                <div key={rec.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="font-semibold text-gray-900">{rec.filename}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(rec.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>
          <div className="space-y-3">
            {dueCount > 0 && (
              <Link
                href="/learn"
                className="block rounded-lg border border-blue-200 bg-blue-50 p-6 text-center hover:bg-blue-100"
              >
                <p className="text-lg font-semibold text-blue-700">
                  📚 {dueCount} cards ready to review
                </p>
                <p className="mt-1 text-sm text-blue-600">Start learning now</p>
              </Link>
            )}

            <Link
              href="/upload"
              className="block rounded-lg border border-green-200 bg-green-50 p-6 text-center hover:bg-green-100"
            >
              <p className="text-lg font-semibold text-green-700">⬆️ Upload Recordings</p>
              <p className="mt-1 text-sm text-green-600">Add new audio files</p>
            </Link>

            <Link
              href="/stats"
              className="block rounded-lg border border-purple-200 bg-purple-50 p-6 text-center hover:bg-purple-100"
            >
              <p className="text-lg font-semibold text-purple-700">📊 View Statistics</p>
              <p className="mt-1 text-sm text-purple-600">Track your progress</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
