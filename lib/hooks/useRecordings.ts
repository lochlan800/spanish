'use client';

import { useState, useEffect } from 'react';
import { Recording } from '@/types';
import { createRecording, getAllRecordings, removeRecording } from '@/lib/storage/recordings';

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRecordings();
      setRecordings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const uploadRecording = async (file: File, mixId: string) => {
    try {
      setError(null);
      const recording = await createRecording(file, mixId);
      setRecordings((prev) => [...prev, recording]);
      return recording;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload recording';
      setError(errorMsg);
      throw err;
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      await removeRecording(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete recording';
      setError(errorMsg);
      throw err;
    }
  };

  return {
    recordings,
    isLoading,
    error,
    uploadRecording,
    deleteRecording,
    refetch: loadRecordings,
  };
}
