import { Card, Recording, UserStats } from '@/types';

const DB_NAME = 'SpanishLearner';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('recordings')) {
        database.createObjectStore('recordings', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('cards')) {
        const cardStore = database.createObjectStore('cards', { keyPath: 'id' });
        cardStore.createIndex('recordingId', 'recordingId', { unique: false });
        cardStore.createIndex('nextReviewDate', 'nextReviewDate', { unique: false });
      }

      if (!database.objectStoreNames.contains('userStats')) {
        database.createObjectStore('userStats', { keyPath: 'id' });
      }
    };
  });
}

export async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  return initDB();
}

export async function addRecording(recording: Recording): Promise<string> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['recordings'], 'readwrite');
    const store = tx.objectStore('recordings');
    const request = store.add(recording);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string);
  });
}

export async function getRecordings(): Promise<Recording[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['recordings'], 'readonly');
    const store = tx.objectStore('recordings');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Recording[]);
  });
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['recordings'], 'readonly');
    const store = tx.objectStore('recordings');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['recordings'], 'readwrite');
    const store = tx.objectStore('recordings');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function addCard(card: Card): Promise<string> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readwrite');
    const store = tx.objectStore('cards');
    const request = store.add(card);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string);
  });
}

export async function getCards(): Promise<Card[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readonly');
    const store = tx.objectStore('cards');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Card[]);
  });
}

export async function getCardsByRecording(recordingId: string): Promise<Card[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readonly');
    const store = tx.objectStore('cards');
    const index = store.index('recordingId');
    const request = index.getAll(recordingId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Card[]);
  });
}

export async function getCard(id: string): Promise<Card | undefined> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readonly');
    const store = tx.objectStore('cards');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function updateCard(card: Card): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readwrite');
    const store = tx.objectStore('cards');
    const request = store.put(card);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteCard(id: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readwrite');
    const store = tx.objectStore('cards');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getCardsDue(): Promise<Card[]> {
  const database = await getDB();
  const now = Date.now();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['cards'], 'readonly');
    const store = tx.objectStore('cards');
    const index = store.index('nextReviewDate');
    const range = IDBKeyRange.upperBound(now);
    const request = index.getAll(range);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Card[]);
  });
}

export async function getUserStats(): Promise<UserStats> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['userStats'], 'readonly');
    const store = tx.objectStore('userStats');
    const request = store.get('main');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const stats = request.result as UserStats | undefined;
      if (stats) {
        resolve(stats);
      } else {
        resolve({
          totalCards: 0,
          cardsLearned: 0,
          cardsReviewing: 0,
          totalReviews: 0,
          currentStreak: 0,
          lastActivityDate: null,
        });
      }
    };
  });
}

export async function updateUserStats(stats: UserStats): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['userStats'], 'readwrite');
    const store = tx.objectStore('userStats');
    const request = store.put({ ...stats, id: 'main' });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearDatabase(): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(['recordings', 'cards', 'userStats'], 'readwrite');

    const recReq = tx.objectStore('recordings').clear();
    const cardReq = tx.objectStore('cards').clear();
    const statsReq = tx.objectStore('userStats').clear();

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
}
