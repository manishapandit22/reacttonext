import { useGameContext } from "@/contexts/GameContext";
import { useEffect, useRef, useCallback } from "react";

interface SaveProps<T> {
  onSave: (value: T) => void | Promise<any>;
  delay?: number;
}

interface AutoSaveProps<T> {
  onSave: (value: T) => void | Promise<any>;
  delay?: number;
  condition?: (value: T) => boolean;
  key?: string;
}

export default function useSaveWithDebounce<T>({ onSave, delay = 5000 }: SaveProps<T>) {
  const onSaveRef = useRef(onSave);
  const { setSaving } = useGameContext();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const debouncedSave = useCallback(
    (value: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSaving(true);
      timerRef.current = setTimeout(() => {
        const result = onSaveRef.current(value);
        if (result instanceof Promise) {
          result
            .catch((err) => {
              console.error("Error in debounced save:", err);
            })
            .finally(() => {
              setSaving(false);
            });
        } else {
          setSaving(false);
        }
      }, delay);
    },
    [delay, setSaving]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSaving(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return debouncedSave;
}

export function useAutoSaveWithDebounce<T>({ 
  onSave, 
  delay = 3000, 
  condition, 
  key 
}: AutoSaveProps<T>) {
  const onSaveRef = useRef(onSave);
  const { setSaving } = useGameContext();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<Promise<any> | null>(null);
  const lastSavedValueRef = useRef<string>('');
  const isInitializedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const debouncedAutoSave = useCallback(
    (value: T) => {
      if (condition && !condition(value)) {
        return;
      }

      const valueKey = key ? `${key}-${JSON.stringify(value)}` : JSON.stringify(value);
      
      if (lastSavedValueRef.current === valueKey) {
        return;
      }

      if (pendingRequestRef.current) {
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setSaving(true);
      timerRef.current = setTimeout(async () => {
        try {
          pendingRequestRef.current = onSaveRef.current(value);
          await pendingRequestRef.current;
          lastSavedValueRef.current = valueKey;
          
          if (key) {
            isInitializedRef.current.add(key);
          }
        } catch (err) {
          console.error("Error in autosave:", err);
        } finally {
          pendingRequestRef.current = null;
          setSaving(false);
        }
      }, delay);
    },
    [delay, setSaving, condition, key]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSaving(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return debouncedAutoSave;
}

export function useMultiAutoSave<T>({ 
  onSave, 
  delay = 3000, 
  condition 
}: Omit<AutoSaveProps<T>, 'key'>) {
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingRequestsRef = useRef<Map<string, Promise<any>>>(new Map());
  const lastSavedValuesRef = useRef<Map<string, string>>(new Map());
  const { setSaving } = useGameContext();

  const debouncedAutoSave = useCallback(
    (value: T, uniqueKey: string) => {
      if (condition && !condition(value)) {
        return;
      }

      const valueKey = `${uniqueKey}-${JSON.stringify(value)}`;
      
      if (lastSavedValuesRef.current.get(uniqueKey) === valueKey) {
        return;
      }

      if (pendingRequestsRef.current.has(uniqueKey)) {
        return;
      }

      const existingTimer = timersRef.current.get(uniqueKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
        timersRef.current.delete(uniqueKey);
      }

      setSaving(true);
      const timer = setTimeout(async () => {
        try {
          const request = onSave(value);
          pendingRequestsRef.current.set(uniqueKey, request);
          await request;
          lastSavedValuesRef.current.set(uniqueKey, valueKey);
        } catch (err) {
          console.error("Error in autosave:", err);
        } finally {
          pendingRequestsRef.current.delete(uniqueKey);
          setSaving(false);
        }
      }, delay);

      timersRef.current.set(uniqueKey, timer);
    },
    [delay, setSaving, condition, onSave]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
      setSaving(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return debouncedAutoSave;
}