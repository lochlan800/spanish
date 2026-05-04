'use client';

import { useState } from 'react';
import { Card } from '@/types';

interface CardStatsProps {
  card: Card;
  onRate: (quality: number) => Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
}

export function CardStats({ card, onRate, onSkip, isLoading = false }: CardStatsProps) {
  const [showSpanish, setShowSpanish] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (quality: number) => {
    setIsSubmitting(true);
    try {
      await onRate(quality);
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficulties = {
    new: 'New',
    learning: 'Learning',
    review: 'Reviewing',
    graduated: 'Graduated',
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{difficulties[card.difficulty]}</span>
          {' • '}
          <span>Interval: {card.interval} days</span>
        </div>
        <div className="text-sm text-gray-600">
          {card.totalReviews} reviews
          {card.totalReviews > 0 &&
            ` • ${Math.round((card.correctReviews / card.totalReviews) * 100)}% correct`}
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <p className="mb-4 text-center text-2xl font-semibold text-gray-900">
          {card.english}
        </p>

        <button
          onClick={() => setShowSpanish(!showSpanish)}
          className="mx-auto block rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
        >
          {showSpanish ? '🔒 Hide Translation' : '🔓 Show Translation'}
        </button>

        {showSpanish && (
          <p className="mt-4 text-center text-lg text-green-700">{card.spanish}</p>
        )}
      </div>

      <div className="mb-4 rounded-lg bg-blue-50 p-3">
        <p className="text-sm text-gray-600">
          Rate how well you remembered this (0 = forgot, 5 = perfect)
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {[0, 1, 2, 3, 4, 5].map((quality) => (
          <button
            key={quality}
            onClick={() => handleRate(quality)}
            disabled={isLoading || isSubmitting}
            className={`rounded py-2 font-semibold transition-colors ${
              quality < 3
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            {quality}
          </button>
        ))}
      </div>

      {onSkip && (
        <button
          onClick={onSkip}
          disabled={isLoading || isSubmitting}
          className="mt-4 w-full rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 disabled:opacity-50"
        >
          Skip
        </button>
      )}
    </div>
  );
}
