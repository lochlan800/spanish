'use client';

import { useEffect, useState } from 'react';
import { usePlaylist } from '@/lib/hooks/usePlaylist';
import { PlaylistPlayer } from '@/components/PlaylistPlayer';
import { getAllMixes } from '@/lib/storage/mixes';
import { Mix } from '@/types';

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

  const [mixes, setMixes] = useState<Mix[]>([]);
  const [selectedMixId, setSelectedMixId] = useState<string>('');

  useEffect(() => {
    loadMixes();
  }, []);

  const loadMixes = async () => {
    try {
      const allMixes = await getAllMixes();
      setMixes(allMixes);
      if (allMixes.length > 0) {
        setSelectedMixId(allMixes[0].id);
      }
    } catch (err) {
      console.error('Failed to load mixes:', err);
    }
  };

  const filteredRecordings = recordings.filter((rec) => rec.mixId === selectedMixId);
  const filteredShuffledPlaylist = shuffledPlaylist.filter((rec) => rec.mixId === selectedMixId);
  const currentRecording = filteredShuffledPlaylist[currentIndex];
  const selectedMixName = mixes.find((m) => m.id === selectedMixId)?.name;

  const handleShuffleForMix = () => {
    if (filteredRecordings.length === 0) return;
    shuffle();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (mixes.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-xl font-semibold text-gray-900">No mixes yet</p>
          <p className="text-gray-600">Create a mix on the Mixes page and upload recordings!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">🎵 Playlist</h1>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Mix:</label>
        <select
          value={selectedMixId}
          onChange={(e) => setSelectedMixId(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-lg"
        >
          {mixes.map((mix) => (
            <option key={mix.id} value={mix.id}>
              {mix.name}
            </option>
          ))}
        </select>
      </div>

      {filteredRecordings.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-xl font-semibold text-gray-900">No recordings in this mix</p>
          <p className="text-gray-600">Upload audio files to {selectedMixName} on the Upload page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">
                Mix: <span className="text-lg text-green-900">{selectedMixName}</span>
              </p>
            </div>

            <h2 className="mb-4 text-xl font-semibold">Player</h2>
            <PlaylistPlayer
              audioRef={audioRef}
              currentRecording={currentRecording}
              isPlaying={isPlaying}
              currentIndex={currentIndex}
              totalRecordings={filteredShuffledPlaylist.length}
              onTogglePlay={togglePlayPause}
              onSkipNext={skipNext}
              onSkipPrevious={skipPrevious}
            />

            <div className="mt-6">
              <button
                onClick={handleShuffleForMix}
                className="w-full rounded bg-purple-500 px-6 py-3 text-lg font-semibold text-white hover:bg-purple-600"
              >
                🔀 Shuffle All ({filteredRecordings.length})
              </button>
            </div>

            {filteredShuffledPlaylist.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
                {filteredShuffledPlaylist.length} recordings in shuffle mode
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Playlist Queue</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
              {filteredShuffledPlaylist.length === 0 ? (
                <p className="text-gray-600">Click "Shuffle All" to create a playlist</p>
              ) : (
                filteredShuffledPlaylist.map((rec, index) => (
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
