'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Layout/Navbar';
import { SearchFilters } from '@/components/JobSearch/SearchFilters';
import { CreateJobForm } from '@/components/CreateJob/CreateJobForm';
import { useSearch } from '@/context/SearchContext';
import { useLoader } from '@/context/LoaderContext';

const SEARCH_PAGES = ['/', '/jobs'];

const PAGE_MESSAGES: Record<string, string> = {
  '/': 'home',
  '/jobs': 'jobs',
  '/drafts': 'drafts',
  '/talents': 'talents',
  '/about': 'about',
  '/testimonials': 'testimonials',
};

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openCreateModal, createModalOpen, closeCreateModal } = useSearch();
  const { showLoader, hideLoader } = useLoader();
  const showSearch = SEARCH_PAGES.includes(pathname);

  // Show loader on initial page load
  useEffect(() => {
    const context = PAGE_MESSAGES[pathname] ?? 'default';
    showLoader(context);
    hideLoader(); // schedules hide after 2.5s
  // Only runs once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar onCreateJob={openCreateModal} />
      {showSearch && <SearchFilters />}
      <CreateJobForm
        opened={createModalOpen}
        onClose={closeCreateModal}
        onJobCreated={() => {}}
        mode="create"
      />
      {children}
    </>
  );
}