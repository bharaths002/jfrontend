'use client';

import { Box, Container, Group, Image, Button, Burger, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavbarProps {
  onCreateJob?: () => void;
}

export function Navbar({ onCreateJob }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/jobs', label: 'Find Jobs' },
    { href: '/talents', label: 'Find Talents' },
    { href: '/about', label: 'About us' },
    { href: '/testimonials', label: 'Testimonials' },
  ];

  return (
    <>
      <Box
        component="header"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          zIndex: 1000,
          borderRadius: '30px',
          margin: '16px auto',
          border: '1px solid #eee',
          maxWidth: '90%',
        }}
      >
        <Container size="xl">
          <Box py="md">
            <Group justify="space-between" align="center">
              {/* Logo + Website Name */}
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                }}
              >
                <Image
                  src="/logos/companylogo.png"
                  alt="Hire-Re Logo"
                  width={40}
                  height={40}
                  style={{ cursor: 'pointer' }}
                />

                <Box
                  component="span"
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#7B3FF2',
                    letterSpacing: '-0.5px',
                    cursor: 'pointer',
                  }}
                >
                  Hire-Re
                </Box>
              </Link>

              {/* Desktop links */}
              <Group gap="xl" align="center" visibleFrom="md">
                {links.map(l => (
                  <Link key={l.href} href={l.href}
                    style={{ color: 'black', textDecoration: 'none', fontWeight: 500 }}>
                    {l.label}
                  </Link>
                ))}
              </Group>

              {/* Desktop buttons */}
              <Group gap="sm" visibleFrom="md">
                <Link href="/drafts" style={{ textDecoration: 'none' }}>
                  <Button variant="outline"
                    style={{ borderColor: '#7B3FF2', color: '#7B3FF2', borderRadius: '25px' }}>
                    Drafts
                  </Button>
                </Link>
                <Button onClick={onCreateJob}
                  style={{ backgroundColor: '#7B3FF2', borderRadius: '25px' }}>
                  Create Jobs
                </Button>
              </Group>

              {/* Mobile burger */}
              <Burger opened={drawerOpen} onClick={toggleDrawer} hiddenFrom="md" />
            </Group>
          </Box>
        </Container>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title="Menu"
        size="xs"
        position="right"
        styles={{ title: { fontWeight: 700, color: '#7B3FF2' } }}
      >
        <Stack gap="md">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={closeDrawer}
              style={{ color: 'black', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>
              {l.label}
            </Link>
          ))}
          <Link href="/drafts" style={{ textDecoration: 'none' }} onClick={closeDrawer}>
            <Button fullWidth variant="outline"
              style={{ borderColor: '#7B3FF2', color: '#7B3FF2', borderRadius: '25px' }}>
              Drafts
            </Button>
          </Link>
          <Button fullWidth onClick={() => { onCreateJob?.(); closeDrawer(); }}
            style={{ backgroundColor: '#7B3FF2', borderRadius: '25px' }}>
            Create Jobs
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}