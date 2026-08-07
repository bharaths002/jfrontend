import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { SearchProvider } from '@/context/SearchContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { LayoutShell } from '@/components/Layout/LayoutShell';
import { GlobalLoader } from '@/components/Layout/GlobalLoader';
import { NavigationLoader } from '@/components/Layout/NavigationLoader';

export const metadata: Metadata = {
  title: 'Hire-Re',
  description: 'Find your next opportunity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body style={{ margin: 0, backgroundColor: '#F8F9FA' }}>
        <MantineProvider defaultColorScheme="light">
          <Notifications />
          <LoaderProvider>
            <SearchProvider>
              {/* GlobalLoader renders on top of everything */}
              <GlobalLoader />
              {/* NavigationLoader watches route changes — needs Suspense for useSearchParams */}
              <Suspense fallback={null}>
                <NavigationLoader />
              </Suspense>
              <LayoutShell>{children}</LayoutShell>
            </SearchProvider>
          </LoaderProvider>
        </MantineProvider>
      </body>
    </html>
  );
}