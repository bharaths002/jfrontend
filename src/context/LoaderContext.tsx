'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoaderContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  message: string;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showLoader = useCallback((msg = '') => {
    if (timer) clearTimeout(timer);
    setMessage(msg);
    setIsLoading(true);
  }, [timer]);

  const hideLoader = useCallback(() => {
    // Minimum visible time of 2.5s
    const t = setTimeout(() => {
      setIsLoading(false);
      setMessage('');
    }, 2500);
    setTimer(t);
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, message }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error('useLoader must be used inside LoaderProvider');
  return ctx;
}