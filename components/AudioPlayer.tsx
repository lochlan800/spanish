'use client';

import { useAudioPlayer } from '@/lib/hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioUrl?: string;
  startTime?: number;
  endTime?: number;
  showControls?: boolean;
}

export function AudioPlayer({
  audioUrl,
  startTime = 0,
  endTime,
  showControls = true,
}: AudioPlayerProps) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    togglePlayPause,
    seek,
    changePlaybackRate,
    repeatSegment,
  } = useAudioPlayer({ audioUrl, startTime, endTime });

  const formatTime = (time: number) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4">
      <audio ref={audioRef} />

      {showControls && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={togglePlayPause}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={repeatSegment}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              🔄 Repeat
            </button>
          </div>

          <div className="flex gap-2">
            <label className="text-sm">
              Speed:
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="ml-2 rounded border border-gray-300 px-2 py-1"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
