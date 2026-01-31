"use client";

import { useEffect, useState } from "react";

const DEFAULT_MS = 700;

/**
 * Returns a debounced version of the value. Updates after `delay` ms of no changes.
 */
export function useDebouncedValue<T>(value: T, delay: number = DEFAULT_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
