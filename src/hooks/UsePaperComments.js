// src/hooks/usePaperComments.js
import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { nostrProcessor } from '../services/nostrProcessor';

export function usePaperComments(doi) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doi) return;

    setIsLoading(true);
    setError(null);

    // Initial load of comments from database
    db.getCommentsByDOI(doi)
      .then(setComments)
      .catch(err => {
        console.error('Error loading comments from DB:', err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    // Subscribe to database updates
    const unsubscribe = db.subscribe(doi, (updatedComments) => {
      console.log('Received database update for DOI:', doi, updatedComments);
      setComments(updatedComments);
    });

    // Subscribe to nostr events
    nostrProcessor.subscribe(doi).catch(err => {
      console.error('Error subscribing to nostr events:', err);
      setError(err.message);
    });

    // Cleanup
    return () => {
      unsubscribe();
      nostrProcessor.unsubscribe(doi);
    };
  }, [doi]);

  const addComment = async (content, privkey, parentId = null) => {
    try {
      await nostrProcessor.publishComment(content, doi, privkey, parentId);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    comments,
    isLoading,
    error,
    addComment
  };
}
