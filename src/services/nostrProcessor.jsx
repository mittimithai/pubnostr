// src/services/nostrProcessor.js
import { SimplePool } from 'nostr-tools';
import { db } from './database';

export class NostrProcessor {
  constructor(relays) {
    this.pool = new SimplePool();
    this.relays = relays;
    this.subscriptions = new Map();
  }

  processEvent(event) {
    // Extract DOI from event tags
    const doiTag = event.tags.find(tag => tag[0] === 'doi');
    if (!doiTag) return;

    const doi = doiTag[1];
    const parentId = event.tags.find(tag => tag[0] === 'e')?.[1];

    // Convert nostr event to our comment format
    const comment = {
      id: event.id,
      doi,
      parentId,
      content: event.content,
      author: event.pubkey,
      createdAt: event.created_at * 1000,
      signature: event.sig,
      nostrEvent: event // Store original event for reference
    };

    // Add to database
    db.addComment(comment);
  }

  // Subscribe to events for a specific DOI
  async subscribe(doi) {
    if (this.subscriptions.has(doi)) {
      return;
    }

    try {
      const filter = {
        kinds: [1], // Regular notes
        '#doi': [doi],
        // You might want to add more filter criteria
      };

      console.log('Subscribing to DOI:', doi, 'with filter:', filter);

      const sub = this.pool.sub(this.relays, [filter]);
      
      sub.on('event', event => {
        console.log('Received event:', event);
        this.processEvent(event);
      });

      sub.on('eose', () => {
        console.log('End of stored events for DOI:', doi);
      });

      this.subscriptions.set(doi, sub);
    } catch (error) {
      console.error('Error subscribing to DOI:', doi, error);
      throw error;
    }
  }

  // Unsubscribe from events for a specific DOI
  unsubscribe(doi) {
    const sub = this.subscriptions.get(doi);
    if (sub) {
      sub.unsub();
      this.subscriptions.delete(doi);
    }
  }

  // Publish a new comment
  async publishComment(content, doi, privkey, parentId = null) {
    const tags = [
      ['doi', doi],
      ['t', 'paper-comment']
    ];

    if (parentId) {
      tags.push(['e', parentId, '', 'reply']);
    }

    const event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content
    };

    try {
      const pub = await this.pool.publish(this.relays, event);
      return pub;
    } catch (error) {
      console.error('Error publishing comment:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const nostrProcessor = new NostrProcessor([
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
]);
