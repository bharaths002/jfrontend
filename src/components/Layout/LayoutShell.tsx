'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { SearchFilters } from '@/components/JobSearch/SearchFilters';
import { CreateJobForm } from '@/components/CreateJob/CreateJobForm';
import { useSearch } from '@/context/SearchContext';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
    const { openCreateModal } = useSearch();


  return (
    <>
      <Navbar onCreateJob={openCreateModal} />
      <SearchFilters />
      <CreateJobForm
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onJobCreated={() => {}}
        mode="create"
      />
      {children}
    </>
  );
}