import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

export interface OfflineTask {
  id?: number;
  tempId: string;
  businessId: number;
  data: any;
  action: 'create' | 'update' | 'delete';
  synced: boolean;
  createdAt: Date;
}

export interface OfflineCustomer {
  id?: number;
  tempId: string;
  businessId: number;
  data: any;
  action: 'create' | 'update' | 'delete';
  synced: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private dbPromise: Promise<IDBPDatabase>;
  private readonly DB_NAME = 'pi-business-hub-offline';
  private readonly DB_VERSION = 1;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Tasks store for offline task operations
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('businessId', 'businessId');
          taskStore.createIndex('synced', 'synced');
        }

        // Customers store for offline customer operations
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
          customerStore.createIndex('businessId', 'businessId');
          customerStore.createIndex('synced', 'synced');
        }

        // Cache store for API responses
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry');
        }
      }
    });
  }

  // Task operations
  async saveOfflineTask(task: Omit<OfflineTask, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return db.add('tasks', task) as Promise<number>;
  }

  async getUnsynedTasks(): Promise<OfflineTask[]> {
    const db = await this.dbPromise;
    const allTasks = await db.getAll('tasks');
    return allTasks.filter(task => !task.synced);
  }

  async markTaskSynced(id: number): Promise<void> {
    const db = await this.dbPromise;
    const task = await db.get('tasks', id);
    if (task) {
      task.synced = true;
      await db.put('tasks', task);
    }
  }

  async deleteOfflineTask(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('tasks', id);
  }

  // Customer operations
  async saveOfflineCustomer(customer: Omit<OfflineCustomer, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return db.add('customers', customer) as Promise<number>;
  }

  async getUnsynedCustomers(): Promise<OfflineCustomer[]> {
    const db = await this.dbPromise;
    const allCustomers = await db.getAll('customers');
    return allCustomers.filter(customer => !customer.synced);
  }

  async markCustomerSynced(id: number): Promise<void> {
    const db = await this.dbPromise;
    const customer = await db.get('customers', id);
    if (customer) {
      customer.synced = true;
      await db.put('customers', customer);
    }
  }

  // Cache operations
  async cacheData(key: string, data: any, expiryMinutes: number = 60): Promise<void> {
    const db = await this.dbPromise;
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    await db.put('cache', { key, data, expiry });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const db = await this.dbPromise;
    const cached = await db.get('cache', key);
    if (!cached) return null;
    if (new Date(cached.expiry) < new Date()) {
      await db.delete('cache', key);
      return null;
    }
    return cached.data as T;
  }

  async clearCache(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('cache');
  }

  // Sync all pending changes
  async getPendingChangesCount(): Promise<number> {
    const tasks = await this.getUnsynedTasks();
    const customers = await this.getUnsynedCustomers();
    return tasks.length + customers.length;
  }
}
