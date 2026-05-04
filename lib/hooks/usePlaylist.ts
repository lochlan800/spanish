'use client';

import { useState, useEffect, useRef } from 'react';
import { Recording } from '@/types';
import { getAllRecordings } from '@/lib/storage/recordings';

export function usePlaylist() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Recording[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadRecordings = async () => {
      try {
        setIsLoading(true);
        const recs = await getAllRecordings();
        setRecordings(recs);
      } catch (err) {
        console.error('Failed to load recordings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      skipNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentIndex, shuffledPlaylist]);

  const shuffle = () => {
    if (recordings.length === 0) return;
    const shuffled = [...recordings].sort(() => Math.random() - 0.5);
    setShuffledPlaylist(shuffled);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const play = () => {
    if (audioRef.current && shuffledPlaylist.length > 0) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipNext = () => {
    if (shuffledPlaylist.length === 0) return;

    const nextIndex = (currentIndex + 1) % shuffledPlaylist.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = shuffledPlaylist[nextIndex].audioUrl;
      audioRef.current.play();
    }
  };

  const skipPrevious = () => {
    if (shuffledPlaylist.length === 0) return;

    const prevIndex = currentIndex === 0 ? shuffledPlaylist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = shuffledPlaylist[prevIndex].audioUrl;
      audioRef.current.play();
    }
  };

  const playRecording = (index: number) => {
    if (index >= 0 && index < shuffledPlaylist.length) {
      setCurrentIndex(index);
      setIsPlaying(true);

      if (audioRef.current) {
        audioRef.current.src = shuffledPlaylist[index].audioUrl;
        audioRef.current.play();
      }
    }
  };

  return {
    recordings,
    shuffledPlaylist,
    currentIndex,
    isPlaying,
    isLoading,
    audioRef,
    shuffle,
    play,
    pause,
    togglePlayPause,
    skipNext,
    skipPrevious,
    playRecording,
  };
}
