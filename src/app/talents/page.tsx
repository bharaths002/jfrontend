import { Box, Container, Center, Text, ThemeIcon } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';

export default function TalentsPage() {
  return (
    <Box style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <Center style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <ThemeIcon size={72} radius="xl" variant="light" color="violet">
            <IconUsers size={36} />
          </ThemeIcon>
          <Text fw={700} size="xl" c="violet.6">Find Talents</Text>
          <Text c="dimmed" ta="center" maw={400}>
            Talent discovery will appear here. Browse candidate profiles, filter by skills and experience, and connect with top talent.
          </Text>
        </Center>
      </Container>
    </Box>
  );
}