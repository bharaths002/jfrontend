import type { Metadata } from 'next';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { SearchProvider } from '@/context/SearchContext';
import { LayoutShell } from '@/components/Layout/LayoutShell';

export const metadata: Metadata = {
  title: 'Job Portal',
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
          <SearchProvider>
            <LayoutShell>{children}</LayoutShell>
          </SearchProvider>
        </MantineProvider>
      </body>
    </html>
    
  );
}