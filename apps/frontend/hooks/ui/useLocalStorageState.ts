"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch {
      setValue(initialValueRef.current);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [isHydrated, key, value]);

  return [value, setValue, isHydrated] as const;
}
