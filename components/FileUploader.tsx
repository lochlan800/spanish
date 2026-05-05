'use client';

import { useState, useRef } from 'react';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  acceptedFormats?: string[];
  isLoading?: boolean;
  error?: string | null;
}

export function FileUploader({
  onUpload,
  acceptedFormats = ['.mp3', '.wav', '.m4a'],
  isLoading = false,
  error = null,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (acceptedFormats.some((fmt) => file.name.toLowerCase().endsWith(fmt))) {
        try {
          await onUpload(file);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        try {
          await onUpload(files[i]);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <p className="mb-4 text-gray-700">
          Drag and drop audio files here, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '⏳ Uploading...' : '📁 Browse Files'}
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Accepted formats: {acceptedFormats.join(', ')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        disabled={isLoading}
        className="hidden"
      />

      {error && <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>}
    </div>
  );
}
