'use client';

import { Recording } from '@/types';

interface PlaylistPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentRecording: Recording | undefined;
  isPlaying: boolean;
  currentIndex: number;
  totalRecordings: number;
  onTogglePlay: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
}

export function PlaylistPlayer({
  audioRef,
  currentRecording,
  isPlaying,
  currentIndex,
  totalRecordings,
  onTogglePlay,
  onSkipNext,
  onSkipPrevious,
}: PlaylistPlayerProps) {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      <audio ref={audioRef} />

      <div className="mb-6 text-center">
        {currentRecording ? (
          <>
            <p className="text-sm text-gray-600">Now Playing</p>
            <p className="text-2xl font-bold text-gray-900">{currentRecording.filename}</p>
            <p className="mt-2 text-lg text-blue-600">
              {currentIndex + 1} of {totalRecordings}
            </p>
          </>
        ) : (
          <p className="text-gray-600">No recording selected</p>
        )}
      </div>

      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={onSkipPrevious}
          disabled={totalRecordings === 0}
          className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 disabled:bg-gray-300"
        >
          ⏮ Previous
        </button>

        <button
          onClick={onTogglePlay}
          disabled={totalRecordings === 0}
          className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={onSkipNext}
          disabled={totalRecordings === 0}
          className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 disabled:bg-gray-300"
        >
          ⏭ Next
        </button>
      </div>

      {currentRecording && (
        <div className="rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-700">
          Duration: {currentRecording.metadata.duration.toFixed(1)}s
        </div>
      )}
    </div>
  );
}
