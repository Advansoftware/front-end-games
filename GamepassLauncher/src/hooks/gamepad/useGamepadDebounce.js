import { useState, useCallback, useRef, useEffect } from 'react';

// Hook para debounce de ações do gamepad
export const useGamepadDebounce = (delay = 200) => {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef(null);
  const delayRef = useRef(delay);

  // Atualizar delay ref quando delay muda
  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

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
    }, delayRef.current);

    return true;
  }, [isDebouncing]); // REMOVIDO delay da dependência

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDebouncing(false);
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debounce,
    reset,
    isDebouncing
  };
};