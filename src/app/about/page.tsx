import { Box, Container, Center, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export default function AboutPage() {
  return (
    <Box style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <Center style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <ThemeIcon size={72} radius="xl" variant="light" color="violet">
            <IconInfoCircle size={36} />
          </ThemeIcon>
          <Text fw={700} size="xl" c="violet.6">About Us</Text>
          <Text c="dimmed" ta="center" maw={400}>
            Our story, mission, and team will appear here. We're building the best job portal experience for candidates and employers alike.
          </Text>
        </Center>
      </Container>
    </Box>
  );
}