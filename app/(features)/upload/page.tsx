'use client';

import { useState, useEffect } from 'react';
import { useRecordings } from '@/lib/hooks/useRecordings';
import { FileUploader } from '@/components/FileUploader';
import { createCard } from '@/lib/storage/cards';
import { getRecording } from '@/lib/storage/recordings';
import { getAllMixes, createMix, getRecordingsInMix } from '@/lib/storage/mixes';
import { Recording, Mix } from '@/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { transcribeAudioSegment, isSpeechRecognitionSupported } from '@/lib/utils/speechRecognition';

type Step = 'select-mix' | 'upload' | 'create-cards';

export default function UploadPage() {
  const { uploadRecording, isLoading: recordingsLoading } = useRecordings();
  const [step, setStep] = useState<Step>('select-mix');
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [selectedMixId, setSelectedMixId] = useState<string>('');
  const [newMixName, setNewMixName] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [mixRecordings, setMixRecordings] = useState<Recording[]>([]);
  const [english, setEnglish] = useState('');
  const [spanish, setSpanish] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMixes();
  }, []);

  useEffect(() => {
    if (selectedMixId && step === 'upload') {
      loadMixRecordings();
    }
  }, [selectedMixId, step]);

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

  const loadMixRecordings = async () => {
    try {
      const recordings = await getRecordingsInMix(selectedMixId);
      setMixRecordings(recordings);
    } catch (err) {
      console.error('Failed to load recordings:', err);
    }
  };

  const handleCreateNewMix = async () => {
    if (!newMixName.trim()) {
      setError('Please enter a mix name');
      return;
    }

    try {
      const mix = await createMix(newMixName);
      setMixes((prev) => [...prev, mix]);
      setSelectedMixId(mix.id);
      setNewMixName('');
      setStep('upload');
    } catch (err) {
      setError('Failed to create mix');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      await uploadRecording(file, selectedMixId);
      await loadMixRecordings();
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
        selectedMixId,
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
      setStep('upload');
      await loadMixRecordings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setIsSaving(false);
    }
  };

  const selectMix = (mixId: string) => {
    setSelectedMixId(mixId);
    setStep('upload');
  };

  const handleAutoTranscribe = async () => {
    if (!selectedRecording || !selectedRecording.audioUrl || endTime === 0) {
      setError('Please set start and end times before transcribing');
      return;
    }

    try {
      setIsTranscribing(true);
      setError(null);
      const transcript = await transcribeAudioSegment(
        selectedRecording.audioUrl,
        startTime,
        endTime
      );
      // Populate both fields with transcribed text - user can edit
      setEnglish(transcript);
      setSpanish(transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  if (step === 'select-mix') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">📚 Choose a Mix to Upload To</h1>

        {mixes.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {mixes.map((mix) => (
              <button
                key={mix.id}
                onClick={() => selectMix(mix.id)}
                className="rounded-lg border-2 border-gray-300 bg-white p-6 text-left font-semibold text-gray-900 transition-all hover:border-blue-500 hover:bg-blue-50"
              >
                {mix.name}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New Mix First</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newMixName}
              onChange={(e) => setNewMixName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateNewMix()}
              placeholder="E.g., Travelling, Home, Business..."
              className="flex-1 rounded border border-gray-300 px-3 py-2"
            />
            <button
              onClick={handleCreateNewMix}
              className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          onClick={() => setStep('select-mix')}
          className="mb-4 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
        >
          ← Back to Mixes
        </button>

        <div className="mb-6 rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
          <p className="text-lg font-semibold text-blue-700">
            📤 Uploading to: <span className="text-blue-900">{mixes.find((m) => m.id === selectedMixId)?.name}</span>
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Upload Audio Files</h2>
          <FileUploader
            onUpload={handleUpload}
            isLoading={recordingsLoading}
            error={error}
          />
        </div>

        {mixRecordings.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Recordings in {mixes.find((m) => m.id === selectedMixId)?.name}</h2>
            <div className="space-y-3">
              {mixRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-lg border border-gray-300 p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{rec.filename}</p>
                    <p className="text-sm text-gray-600">
                      Duration: {rec.metadata.duration.toFixed(1)}s
                    </p>
                  </div>
                  <button
                    onClick={() => selectRecording(rec.id)}
                    className="ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Create Card →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'create-cards' && selectedRecording) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          onClick={() => setStep('upload')}
          className="mb-4 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
        >
          ← Back to Upload
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Create Card: {selectedRecording.filename}
          </h2>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Audio Preview</h3>
            <AudioPlayer audioUrl={selectedRecording.audioUrl} />
          </div>

          {isSpeechRecognitionSupported() && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-3">
                💡 Set start and end times, then click to automatically transcribe the audio segment
              </p>
              <button
                onClick={handleAutoTranscribe}
                disabled={isTranscribing || endTime === 0}
                className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isTranscribing ? '🎤 Transcribing...' : '🎤 Auto-Transcribe'}
              </button>
            </div>
          )}

          {!isSpeechRecognitionSupported() && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700">
                ⚠️ Speech Recognition is not supported in this browser. Please enter text manually.
              </p>
            </div>
          )}

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
    );
  }

  return null;
}
