import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where, Query } from "firebase/firestore";

export type RealtimeCallback<T> = (data: T[]) => void;
export type RealtimeErrorCallback = (error: Error) => void;

/**
 * Subscribe to real-time updates for a Firestore collection
 */
export function subscribeToCollection<T>(
  collectionName: string,
  callback: RealtimeCallback<T>,
  onError?: RealtimeErrorCallback,
  conditions?: { field: string; operator: any; value: any }[]
): () => void {
  try {
    let queryRef: Query = collection(db, collectionName);

    // Apply conditions if provided
    if (conditions && conditions.length > 0) {
      for (const condition of conditions) {
        queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
      }
    }

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      },
      (error) => {
        console.error(`Real-time subscription error for ${collectionName}:`, error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Failed to subscribe to collection:", error);
    if (onError) onError(error as Error);
    return () => {};
  }
}

/**
 * Subscribe to real-time updates for a single document
 */
export function subscribeToDocument<T>(
  collectionName: string,
  documentId: string,
  callback: (data: T | null) => void,
  onError?: RealtimeErrorCallback
): () => void {
  try {
    const docRef = doc(db, collectionName, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = {
            id: snapshot.id,
            ...snapshot.data()
          } as T;
          callback(data);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Real-time subscription error for document ${documentId}:`, error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Failed to subscribe to document:", error);
    if (onError) onError(error as Error);
    return () => {};
  }
}

/**
 * Hook for real-time collection updates
 */
export function useRealtimeCollection<T>(
  collectionName: string,
  conditions?: { field: string; operator: any; value: any }[]
) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const unsubscribe = subscribeToCollection<T>(
      collectionName,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      conditions
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(conditions)]);

  return { data, loading, error };
}

/**
 * Hook for real-time document updates
 */
export function useRealtimeDocument<T>(
  collectionName: string,
  documentId: string
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToDocument<T>(
      collectionName,
      documentId,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, documentId]);

  return { data, loading, error };
}

import * as React from "react";
