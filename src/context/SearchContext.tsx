'use client';

import React, { createContext, useContext, useState } from 'react';

interface SearchState {
  searchText: string;
  location: string;
  jobType: string;
  salaryRange: [number, number];
}

interface SearchContextType {
  filters: SearchState;
  setFilters: React.Dispatch<React.SetStateAction<SearchState>>;
  createModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<SearchState>({
    searchText: '',
    location: '',
    jobType: '',
    salaryRange: [0, 50],
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <SearchContext.Provider value={{
      filters,
      setFilters,
      createModalOpen,
      openCreateModal: () => setCreateModalOpen(true),
      closeCreateModal: () => setCreateModalOpen(false),
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider');
  return ctx;
}