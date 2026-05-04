export interface Recording {
  id: string;
  filename: string;
  uploadedAt: number;
  audioUrl?: string;
  audioBlob?: Blob;
  audioBase64?: string;
  metadata: {
    duration: number;
    format: string;
    sampleRate: number;
  };
}

export interface Card {
  id: string;
  recordingId: string;
  english: string;
  spanish: string;
  audioStartTime: number;
  audioEndTime: number;

  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: number;
  lastReviewDate: number | null;
  difficulty: 'new' | 'learning' | 'review' | 'graduated';
  lastScore: number | null;

  totalReviews: number;
  correctReviews: number;
  createdAt: number;
}

export interface UserStats {
  totalCards: number;
  cardsLearned: number;
  cardsReviewing: number;
  totalReviews: number;
  currentStreak: number;
  lastActivityDate: number | null;
}

export interface StudySession {
  cardsReviewedToday: number;
  lastReviewTime: number | null;
}
