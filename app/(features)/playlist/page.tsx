'use client';

import { usePlaylist } from '@/lib/hooks/usePlaylist';
import { PlaylistPlayer } from '@/components/PlaylistPlayer';

export default function PlaylistPage() {
  const {
    recordings,
    shuffledPlaylist,
    currentIndex,
    isPlaying,
    isLoading,
    audioRef,
    shuffle,
    togglePlayPause,
    skipNext,
    skipPrevious,
    playRecording,
  } = usePlaylist();

  const currentRecording = shuffledPlaylist[currentIndex];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">🎵 Playlist</h1>

      {recordings.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-xl font-semibold text-gray-900">No recordings yet</p>
          <p className="text-gray-600">Upload some audio files to create a playlist!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Player</h2>
            <PlaylistPlayer
              audioRef={audioRef}
              currentRecording={currentRecording}
              isPlaying={isPlaying}
              currentIndex={currentIndex}
              totalRecordings={shuffledPlaylist.length}
              onTogglePlay={togglePlayPause}
              onSkipNext={skipNext}
              onSkipPrevious={skipPrevious}
            />

            <div className="mt-6">
              <button
                onClick={shuffle}
                className="w-full rounded bg-purple-500 px-6 py-3 text-lg font-semibold text-white hover:bg-purple-600"
              >
                🔀 Shuffle All ({recordings.length})
              </button>
            </div>

            {shuffledPlaylist.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
                {shuffledPlaylist.length} recordings in shuffle mode
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Playlist Queue</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
              {shuffledPlaylist.length === 0 ? (
                <p className="text-gray-600">Click "Shuffle All" to create a playlist</p>
              ) : (
                shuffledPlaylist.map((rec, index) => (
                  <div
                    key={rec.id}
                    onClick={() => playRecording(index)}
                    className={`cursor-pointer rounded-lg p-3 transition-colors ${
                      index === currentIndex
                        ? 'bg-blue-500 text-white font-semibold'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <p className="truncate">
                      {index === currentIndex && isPlaying && '▶ '}
                      {index + 1}. {rec.filename}
                    </p>
                    <p className={`text-sm ${index === currentIndex ? 'text-blue-100' : 'text-gray-600'}`}>
                      {rec.metadata.duration.toFixed(1)}s
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
