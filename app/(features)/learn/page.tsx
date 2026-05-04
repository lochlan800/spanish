'use client';

import { useEffect, useState } from 'react';
import { useSpacedRep } from '@/lib/hooks/useSpacedRep';
import { AudioPlayer } from '@/components/AudioPlayer';
import { CardStats } from '@/components/CardStats';
import { getRecording } from '@/lib/storage/recordings';
import { Card, Recording } from '@/types';
import Link from 'next/link';

export default function LearnPage() {
  const { dueCards, isLoading, submitReview, shuffle } = useSpacedRep();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [recordings, setRecordings] = useState<Record<string, Recording | null>>({});
  const [isFetching, setIsFetching] = useState(false);

  const currentCard = dueCards[currentCardIndex];

  useEffect(() => {
    if (currentCard && !recordings[currentCard.recordingId]) {
      const fetchRecording = async () => {
        setIsFetching(true);
        try {
          const rec = await getRecording(currentCard.recordingId);
          setRecordings((prev) => ({
            ...prev,
            [currentCard.recordingId]: rec || null,
          }));
        } finally {
          setIsFetching(false);
        }
      };
      fetchRecording();
    }
  }, [currentCard, recordings]);

  const handleRate = async (quality: number) => {
    if (!currentCard) return;
    try {
      await submitReview(currentCard.id, quality);
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setCurrentCardIndex(0);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const handleSkip = () => {
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading cards...</p>
        </div>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-xl font-semibold text-gray-900">No cards due today!</p>
          <p className="mb-6 text-gray-600">Great job on staying on top of your learning. Come back tomorrow or upload new recordings.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/upload" className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
              Upload New Recordings
            </Link>
            <Link href="/" className="rounded bg-gray-300 px-6 py-2 hover:bg-gray-400">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const recording = currentCard ? recordings[currentCard.recordingId] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Learning Session</h1>
        <div className="text-lg text-gray-600">
          Card {currentCardIndex + 1} of {dueCards.length}
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{
              width: `${((currentCardIndex + 1) / dueCards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Audio</h2>
          {recording && (
            <AudioPlayer
              audioUrl={recording.audioUrl}
              startTime={currentCard!.audioStartTime}
              endTime={currentCard!.audioEndTime}
            />
          )}
          {isFetching && (
            <div className="rounded-lg border border-gray-300 bg-white p-4 text-center text-gray-600">
              Loading audio...
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Review Card</h2>
          {currentCard && (
            <CardStats
              card={currentCard}
              onRate={handleRate}
              onSkip={handleSkip}
              isLoading={isFetching}
            />
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={shuffle}
          className="rounded bg-purple-500 px-6 py-2 text-white hover:bg-purple-600"
        >
          🔀 Shuffle Remaining
        </button>
      </div>
    </div>
  );
}
