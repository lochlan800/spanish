'use client';

import { useState } from 'react';
import { useRecordings } from '@/lib/hooks/useRecordings';
import { FileUploader } from '@/components/FileUploader';
import { getCardsByRecording, createCard } from '@/lib/storage/cards';
import { getRecording } from '@/lib/storage/recordings';
import { Recording } from '@/types';
import { AudioPlayer } from '@/components/AudioPlayer';

type Step = 'upload' | 'create-cards';

export default function UploadPage() {
  const { recordings, uploadRecording, isLoading } = useRecordings();
  const [step, setStep] = useState<Step>('upload');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [english, setEnglish] = useState('');
  const [spanish, setSpanish] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      await uploadRecording(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const selectRecording = async (id: string) => {
    const rec = await getRecording(id);
    if (rec) {
      setSelectedRecording(rec);
      setStep('create-cards');
    }
  };

  const handleSaveCard = async () => {
    if (!selectedRecording || !english || !spanish || endTime === 0) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await createCard(
        selectedRecording.id,
        english,
        spanish,
        startTime,
        endTime
      );
      setEnglish('');
      setSpanish('');
      setStartTime(0);
      setEndTime(0);
      alert('Card created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Upload & Create Cards</h1>

      {step === 'upload' && (
        <div>
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Step 1: Upload Audio Files</h2>
            <FileUploader
              onUpload={handleUpload}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {recordings.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">Your Recordings</h2>
              <div className="space-y-3">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between rounded-lg border border-gray-300 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{rec.filename}</p>
                      <p className="text-sm text-gray-600">
                        Duration: {rec.metadata.duration.toFixed(1)}s
                      </p>
                    </div>
                    <button
                      onClick={() => selectRecording(rec.id)}
                      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Create Cards →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'create-cards' && selectedRecording && (
        <div>
          <button
            onClick={() => setStep('upload')}
            className="mb-4 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
          >
            ← Back
          </button>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Create Card for: {selectedRecording.filename}
            </h2>

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold">Audio Preview</h3>
              <AudioPlayer audioUrl={selectedRecording.audioUrl} />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Start Time (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  End Time (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                English Text
              </label>
              <input
                type="text"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                placeholder="Enter the English sentence"
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                Spanish Translation
              </label>
              <input
                type="text"
                value={spanish}
                onChange={(e) => setSpanish(e.target.value)}
                placeholder="Enter the Spanish translation"
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

            <button
              onClick={handleSaveCard}
              disabled={isSaving}
              className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSaving ? '💾 Saving...' : '✅ Save Card'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
