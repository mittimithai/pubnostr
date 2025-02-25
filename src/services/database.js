// src/services/database.js
import { openDB } from 'idb';

const DB_NAME = 'pubnostr';
const DB_VERSION = 1;

class DatabaseService {
  constructor() {
    this.dbPromise = this.initDB();
    this.subscribers = new Map(); // DOI -> Set of callback functions
  }

  async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Comments store with indexes
        const commentStore = db.createObjectStore('comments', {
          keyPath: 'id'
        });
        commentStore.createIndex('byDOI', 'doi');
        commentStore.createIndex('byParentId', 'parentId');
        commentStore.createIndex('byTimestamp', 'timestamp');

        // Papers store to cache paper metadata
        const paperStore = db.createObjectStore('papers', {
          keyPath: 'doi'
        });
        paperStore.createIndex('byTimestamp', 'lastUpdated');
      }
    });
  }

  // Subscribe to updates for a specific DOI
  subscribe(doi, callback) {
    if (!this.subscribers.has(doi)) {
      this.subscribers.set(doi, new Set());
    }
    this.subscribers.get(doi).add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(doi);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(doi);
        }
      }
    };
  }

  // Notify subscribers of updates
  notifySubscribers(doi) {
    const subs = this.subscribers.get(doi);
    if (subs) {
      this.getCommentsByDOI(doi).then(comments => {
        subs.forEach(callback => callback(comments));
      });
    }
  }

  // Comment CRUD operations
  async addComment(comment) {
    const db = await this.dbPromise;
    await db.add('comments', {
      ...comment,
      timestamp: Date.now()
    });
    this.notifySubscribers(comment.doi);
  }

  async updateComment(comment) {
    const db = await this.dbPromise;
    await db.put('comments', {
      ...comment,
      lastUpdated: Date.now()
    });
    this.notifySubscribers(comment.doi);
  }

  async deleteComment(id, doi) {
    const db = await this.dbPromise;
    await db.delete('comments', id);
    this.notifySubscribers(doi);
  }

  async getCommentsByDOI(doi) {
    const db = await this.dbPromise;
    const comments = await db.getAllFromIndex('comments', 'byDOI', doi);
    
    // Organize comments into threads
    const threads = new Map();
    const topLevel = [];

    comments.forEach(comment => {
      if (comment.parentId) {
        if (!threads.has(comment.parentId)) {
          threads.set(comment.parentId, []);
        }
        threads.get(comment.parentId).push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    // Attach replies to their parent comments
    return topLevel.map(comment => ({
      ...comment,
      replies: threads.get(comment.id) || []
    }));
  }

  // Paper metadata operations
  async addPaper(paper) {
    const db = await this.dbPromise;
    await db.put('papers', {
      ...paper,
      lastUpdated: Date.now()
    });
  }

  async getPaper(doi) {
    const db = await this.dbPromise;
    return db.get('papers', doi);
  }
}

export const db = new DatabaseService();
