import { Box, Container, Center, Text, ThemeIcon } from '@mantine/core';
import { IconQuote } from '@tabler/icons-react';

export default function TestimonialsPage() {
  return (
    <Box style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <Center style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <ThemeIcon size={72} radius="xl" variant="light" color="violet">
            <IconQuote size={36} />
          </ThemeIcon>
          <Text fw={700} size="xl" c="violet.6">Testimonials</Text>
          <Text c="dimmed" ta="center" maw={400}>
            Success stories from candidates and companies who found their perfect match through our platform will appear here.
          </Text>
        </Center>
      </Container>
    </Box>
  );
}