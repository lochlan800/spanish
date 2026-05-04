'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Recording } from '@/types';
import { getAllCards } from '@/lib/storage/cards';
import { getAllRecordings } from '@/lib/storage/recordings';
import { downloadCSV } from '@/lib/utils/exportCSV';

interface SentenceRow {
  id: string;
  recordingName: string;
  english: string;
  spanish: string;
}

export default function SentencesPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [allCards, allRecordings] = await Promise.all([
          getAllCards(),
          getAllRecordings(),
        ]);
        setCards(allCards);
        setRecordings(allRecordings);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const sentences: SentenceRow[] = useMemo(() => {
    const recordingMap = new Map<string, Recording>();
    recordings.forEach((rec) => recordingMap.set(rec.id, rec));

    return cards.map((card) => ({
      id: card.id,
      recordingName: recordingMap.get(card.recordingId)?.filename || 'Unknown',
      english: card.english,
      spanish: card.spanish,
    }));
  }, [cards, recordings]);

  const filteredSentences = useMemo(() => {
    if (!searchQuery.trim()) return sentences;
    const query = searchQuery.toLowerCase();
    return sentences.filter(
      (s) =>
        s.recordingName.toLowerCase().includes(query) ||
        s.english.toLowerCase().includes(query) ||
        s.spanish.toLowerCase().includes(query)
    );
  }, [sentences, searchQuery]);

  const handleExport = () => {
    if (sentences.length === 0) {
      alert('No sentences to export!');
      return;
    }
    const exportRows = sentences.map((s) => ({
      recordingName: s.recordingName,
      english: s.english,
      spanish: s.spanish,
    }));
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(exportRows, `spanish-sentences-${date}.csv`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading sentences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">📝 All Sentences</h1>
        <button
          onClick={handleExport}
          disabled={sentences.length === 0}
          className="rounded bg-green-500 px-6 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
        >
          📥 Export CSV
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-600">Total Sentences</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{sentences.length}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-600">From Recordings</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{recordings.length}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-600">Showing</div>
          <div className="mt-1 text-2xl font-bold text-green-600">{filteredSentences.length}</div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search sentences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded border border-gray-300 px-4 py-2"
        />
      </div>

      {sentences.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="mb-2 text-xl font-semibold text-gray-900">No sentences yet</p>
          <p className="text-gray-600">
            Upload a recording and create cards on the Upload page to add sentences here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">English</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Spanish</th>
                </tr>
              </thead>
              <tbody>
                {filteredSentences.map((sentence, index) => (
                  <tr
                    key={sentence.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{sentence.recordingName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{sentence.english}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">
                      {sentence.spanish}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSentences.length === 0 && searchQuery && (
            <div className="p-8 text-center text-gray-600">
              No sentences match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
