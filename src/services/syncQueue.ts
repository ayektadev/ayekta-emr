import localforage from 'localforage';
import { uploadPatientDataToDrive, isUserSignedIn } from './googleDrive';

interface QueuedSync {
  id: string;
  ishiId: string;
  jsonContent: string;
  pdfBlob?: Blob;
  timestamp: number;
  attempts: number;
}

const SYNC_QUEUE_KEY = 'ayekta_sync_queue';
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Add patient data to sync queue
 */
export async function addToSyncQueue(
  ishiId: string,
  jsonContent: string,
  pdfBlob?: Blob
): Promise<void> {
  try {
    const queue = await getSyncQueue();

    const queueItem: QueuedSync = {
      id: `sync_${ishiId}_${Date.now()}`,
      ishiId,
      jsonContent,
      pdfBlob,
      timestamp: Date.now(),
      attempts: 0,
    };

    queue.push(queueItem);
    await localforage.setItem(SYNC_QUEUE_KEY, queue);

    console.log('Added to sync queue:', ishiId);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
}

/**
 * Get all queued syncs
 */
async function getSyncQueue(): Promise<QueuedSync[]> {
  try {
    const queue = await localforage.getItem<QueuedSync[]>(SYNC_QUEUE_KEY);
    return queue || [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}

/**
 * Remove item from sync queue
 */
async function removeFromQueue(id: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await localforage.setItem(SYNC_QUEUE_KEY, filtered);
  } catch (error) {
    console.error('Error removing from queue:', error);
  }
}

/**
 * Update queue item attempt count
 */
async function incrementAttempts(id: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const updated = queue.map((item) => {
      if (item.id === id) {
        return { ...item, attempts: item.attempts + 1 };
      }
      return item;
    });
    await localforage.setItem(SYNC_QUEUE_KEY, updated);
  } catch (error) {
    console.error('Error incrementing attempts:', error);
  }
}

/**
 * Process the sync queue
 * Attempts to upload all queued items to Google Drive
 */
export async function processSyncQueue(): Promise<{
  succeeded: number;
  failed: number;
  total: number;
}> {
  if (!isUserSignedIn()) {
    console.log('Not signed in to Google Drive, skipping sync');
    return { succeeded: 0, failed: 0, total: 0 };
  }

  const queue = await getSyncQueue();

  if (queue.length === 0) {
    return { succeeded: 0, failed: 0, total: 0 };
  }

  console.log(`Processing ${queue.length} queued syncs...`);

  let succeeded = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      // Skip if max retries exceeded
      if (item.attempts >= MAX_RETRY_ATTEMPTS) {
        console.warn(`Max retry attempts exceeded for ${item.ishiId}, removing from queue`);
        await removeFromQueue(item.id);
        failed++;
        continue;
      }

      // Attempt upload
      await incrementAttempts(item.id);
      await uploadPatientDataToDrive(item.ishiId, item.jsonContent, item.pdfBlob);

      // Success - remove from queue
      await removeFromQueue(item.id);
      succeeded++;

      console.log(`Successfully synced ${item.ishiId} to Google Drive`);
    } catch (error) {
      console.error(`Error syncing ${item.ishiId}:`, error);
      failed++;
    }
  }

  return { succeeded, failed, total: queue.length };
}

/**
 * Get queue status
 */
export async function getSyncQueueStatus(): Promise<{
  queueLength: number;
  oldestItem?: number;
}> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    return { queueLength: 0 };
  }

  const oldestTimestamp = Math.min(...queue.map((item) => item.timestamp));

  return {
    queueLength: queue.length,
    oldestItem: oldestTimestamp,
  };
}

/**
 * Clear all items from sync queue (use with caution)
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await localforage.setItem(SYNC_QUEUE_KEY, []);
    console.log('Sync queue cleared');
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
}
