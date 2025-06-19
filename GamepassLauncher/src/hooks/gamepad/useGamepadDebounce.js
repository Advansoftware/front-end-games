import { useState, useCallback, useRef } from 'react';

// Hook para debounce de ações do gamepad
export const useGamepadDebounce = (delay = 200) => {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef(null);

  const debounce = useCallback((callback) => {
    if (isDebouncing) return false;

    setIsDebouncing(true);
    callback();

    // Clear timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Definir novo timeout
    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
    }, delay);

    return true;
  }, [isDebouncing, delay]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDebouncing(false);
  }, []);

  return {
    debounce,
    reset,
    isDebouncing
  };
};