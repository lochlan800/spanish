'use client';

interface TranscriptDisplayProps {
  english: string;
  spanish: string;
  revealSpanish: boolean;
  onToggle: () => void;
}

export function TranscriptDisplay({
  english,
  spanish,
  revealSpanish,
  onToggle,
}: TranscriptDisplayProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold text-gray-900">{english}</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {revealSpanish ? '🔒 Hide' : '👀 Show'} Spanish
        </button>
      </div>

      {revealSpanish && (
        <div className="mt-4 text-center">
          <p className="text-lg text-green-700">{spanish}</p>
        </div>
      )}
    </div>
  );
}
