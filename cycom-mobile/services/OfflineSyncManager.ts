import { Alert } from 'react-native';

export interface SyncRecord {
  id: string;
  model: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: number;
}

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private queue: SyncRecord[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private backendUrl: string = 'http://localhost:8000';

  private constructor() {
    // Load initial queue from simulated storage
    this.queue = [];
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    console.log(`[OfflineSyncManager] Network status changed: ${online ? 'ONLINE' : 'OFFLINE'}`);
    if (online) {
      this.syncQueue();
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getQueue(): SyncRecord[] {
    return this.queue;
  }

  /**
   * Queue a new transaction for local processing.
   */
  public async queueTransaction(model: string, action: 'create' | 'update' | 'delete', payload: any) {
    const record: SyncRecord = {
      id: Math.random().toString(36).substring(2, 9),
      model,
      action,
      payload,
      timestamp: Date.now()
    };

    this.queue.push(record);
    console.log(`[OfflineSyncManager] Queued offline transaction for model ${model}:`, record);

    if (this.isOnline) {
      this.syncQueue();
    } else {
      Alert.alert(
        'Offline Mode Active',
        `Transaction queued locally. It will auto-sync once internet connection is restored.`
      );
    }
  }

  /**
   * Clears the sync queue.
   */
  public clearQueue() {
    this.queue = [];
  }

  /**
   * Trigger the synchronization of the offline queue to the backend.
   */
  public async syncQueue(): Promise<boolean> {
    if (this.isSyncing || this.queue.length === 0 || !this.isOnline) {
      return false;
    }

    this.isSyncing = true;
    console.log(`[OfflineSyncManager] Starting sync of ${this.queue.length} records...`);

    try {
      // Send batch requests to backend RPC endpoint
      const res = await fetch(`${this.backendUrl}/api/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer offline_sync_token'
        },
        body: JSON.stringify({
          method: 'sync_offline_batch',
          args: [this.queue]
        })
      });

      if (res.ok) {
        console.log('[OfflineSyncManager] Batch synchronization succeeded.');
        this.queue = []; // Clear queue on success
        this.isSyncing = false;
        return true;
      } else {
        console.warn('[OfflineSyncManager] Sync failed with backend status:', res.status);
      }
    } catch (err) {
      console.error('[OfflineSyncManager] Connection error during sync:', err);
    }

    this.isSyncing = false;
    return false;
  }
}
