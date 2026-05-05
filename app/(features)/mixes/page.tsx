'use client';

import { useEffect, useState } from 'react';
import { Mix } from '@/types';
import { createMix, getAllMixes, updateMixName, deleteMix, getRecordingsInMix } from '@/lib/storage/mixes';

interface MixWithCount extends Mix {
  recordingCount: number;
}

export default function MixesPage() {
  const [mixes, setMixes] = useState<MixWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMixName, setNewMixName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    loadMixes();
  }, []);

  const loadMixes = async () => {
    try {
      setIsLoading(true);
      const allMixes = await getAllMixes();
      const mixesWithCounts = await Promise.all(
        allMixes.map(async (mix) => {
          const recordings = await getRecordingsInMix(mix.id);
          return {
            ...mix,
            recordingCount: recordings.length,
          };
        })
      );
      setMixes(mixesWithCounts);
    } catch (err) {
      console.error('Failed to load mixes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMix = async () => {
    if (!newMixName.trim()) {
      alert('Please enter a mix name');
      return;
    }

    try {
      const mix = await createMix(newMixName);
      setMixes((prev) => [...prev, { ...mix, recordingCount: 0 }]);
      setNewMixName('');
    } catch (err) {
      console.error('Failed to create mix:', err);
      alert('Failed to create mix');
    }
  };

  const handleRenameMix = async (id: string) => {
    if (!renameValue.trim()) {
      alert('Please enter a mix name');
      return;
    }

    try {
      await updateMixName(id, renameValue);
      setMixes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name: renameValue } : m))
      );
      setRenamingId(null);
      setRenameValue('');
    } catch (err) {
      console.error('Failed to rename mix:', err);
      alert('Failed to rename mix');
    }
  };

  const handleDeleteMix = async (id: string) => {
    if (!window.confirm('Delete this mix and all its recordings and cards?')) {
      return;
    }

    try {
      await deleteMix(id);
      setMixes((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete mix:', err);
      alert('Failed to delete mix');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading mixes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">🎯 My Mixes</h1>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Create New Mix</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMixName}
            onChange={(e) => setNewMixName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateMix()}
            placeholder="E.g., Travelling, Home, Business..."
            className="flex-1 rounded border border-gray-300 px-3 py-2"
          />
          <button
            onClick={handleCreateMix}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>

      {mixes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-2 text-xl font-semibold text-gray-900">No mixes yet</p>
          <p className="text-gray-600">Create your first mix above to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mixes.map((mix) => (
            <div
              key={mix.id}
              className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg"
            >
              {renamingId === mix.id ? (
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameMix(mix.id)}
                    autoFocus
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => handleRenameMix(mix.id)}
                    className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setRenamingId(null)}
                    className="rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{mix.name}</h3>
                    <p className="text-sm text-gray-600">
                      {mix.recordingCount} recording{mix.recordingCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRenamingId(mix.id);
                        setRenameValue(mix.name);
                      }}
                      className="flex-1 rounded bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600"
                    >
                      ✏️ Rename
                    </button>
                    <button
                      onClick={() => handleDeleteMix(mix.id)}
                      className="flex-1 rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
