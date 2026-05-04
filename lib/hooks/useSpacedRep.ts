'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types';
import { getDueCards, reviewCard } from '@/lib/storage/cards';

export function useSpacedRep() {
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDueCards = async () => {
    try {
      setIsLoading(true);
      const cards = await getDueCards();
      setDueCards(cards.sort(() => Math.random() - 0.5));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load due cards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDueCards();
  }, []);

  const submitReview = async (cardId: string, quality: number) => {
    try {
      await reviewCard(cardId, quality);
      setDueCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMsg);
      throw err;
    }
  };

  const shuffle = () => {
    setDueCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return {
    dueCards,
    isLoading,
    error,
    submitReview,
    shuffle,
    refetch: loadDueCards,
  };
}
