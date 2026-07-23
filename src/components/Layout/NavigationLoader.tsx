'use client';

// Intercepts Next.js route changes and triggers the global loader
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoader } from '@/context/LoaderContext';

const PAGE_MESSAGES: Record<string, string> = {
  '/': 'home',
  '/jobs': 'jobs',
  '/drafts': 'drafts',
  '/talents': 'talents',
  '/about': 'about',
  '/testimonials': 'testimonials',
};

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoader();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip on initial mount — only trigger on subsequent navigations
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }

    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      const context = PAGE_MESSAGES[pathname] ?? 'default';
      showLoader(context);
      hideLoader(); // schedules hide after 2.5s minimum
    }
  }, [pathname, searchParams, showLoader, hideLoader]);

  return null;
}