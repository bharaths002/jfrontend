'use client';

import { Card, Text, Group, Button, Box, Badge, Stack, Image } from '@mantine/core';
import { IconTrash, IconEdit,IconMapPin } from '@tabler/icons-react';
import { api } from '@/services/api';

interface JobCardProps {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  experience: string;
  locationType: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  jobType: string;
  applicationDeadline?: string | null;
  status?: string;
  postedTime: string;
  onDelete: () => void;
  onUpdate: (jobData: {
    id: number;
    jobTitle: string;
    companyName: string;
    companyLogoUrl?: string;
    location: string;
    jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    experience: string;
    salaryMin: number;
    salaryMax: number;
    jobDescription: string;
    requirements: string;
    responsibilities: string;
    applicationDeadline?: string | null;
    status?: 'draft' | 'published';
  }) => void;
}


function isValidLogoUrl(url?: string): boolean {
  if (!url || url.trim() === '') return false;
  return url.startsWith('http') || url.startsWith('/');
}

export function JobCard({
  id,
  title,
  company,
  companyLogo,
  experience,
  locationType,
  salary,
  salaryMin,
  salaryMax,
  description,
  requirements,
  responsibilities,
  location,
  jobType,
  applicationDeadline,
  status,
  postedTime,
  onDelete,
  onUpdate,
}: JobCardProps) {
  const handleDelete = async () => {
    try {
      await api.deleteJob(id);
      onDelete();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleUpdate = () => {
    onUpdate({
      id,
      jobTitle: title,
      companyName: company,
      companyLogoUrl: companyLogo,
      location,
      jobType: jobType as 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote',
      experience,
      salaryMin,
      salaryMax,
      jobDescription: description,
      requirements,
      responsibilities,
      applicationDeadline: applicationDeadline ?? null,
      status: (status as 'draft' | 'published') ?? 'published',
    });
  };

  const hasLogo = isValidLogoUrl(companyLogo);

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* ── Top: logo + badge ── */}
      <Group justify="space-between" align="flex-start" mb="xs">
        <Box
          style={{
            width: 45, height: 45, borderRadius: 8, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f8f9fa', flexShrink: 0,
          }}
        >
          {hasLogo ? (
            <img
              src={companyLogo}
              alt={company}
              style={{ width: 35, height: 35, objectFit: 'contain' }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = 'none';
                const parent = el.parentElement;
                if (parent) {
                  parent.innerHTML = `<span style="font-weight:700;font-size:18px;color:#7B3FF2">${company.charAt(0).toUpperCase()}</span>`;
                }
              }}
            />
          ) : (
            <Text fw={700} size="lg" c="violet">
              {company.charAt(0).toUpperCase()}
            </Text>
          )}
        </Box>
        <Badge color="blue" variant="light" size="sm">{postedTime}</Badge>
      </Group>

      {/* ── Title + company ── */}
{/* ── Title + Location + Company ── */}
<Stack gap={5} mb="md">
  <Group justify="space-between" align="flex-start" wrap="nowrap">
    <Text
      fw={600}
      size="lg"
      lineClamp={2}
      style={{ flex: 1 }}
    >
      {title}
    </Text>

    <Group gap={4} wrap="nowrap" flex={0} mt={7}>
      <IconMapPin
        size={15}
        stroke={1.8}
        color="#7B3FF2"
      />
      <Text
        size="xs"
        c="violet"
        fw={500}
        lineClamp={1}
      >
        {location}
      </Text>
    </Group>
  </Group>

  <Text size="sm" c="dimmed">
    {company}
  </Text>
</Stack>

      {/* ── Meta pills ── */}
      <Group gap={8} mb="md" wrap="wrap">
        <Text size="sm" c="dimmed">{experience}</Text>
        <Text size="sm" c="dimmed">•</Text>
        <Text size="sm" c="dimmed">{locationType}</Text>
        <Text size="sm" c="dimmed">•</Text>
        <Text size="sm" c="dimmed">{salary}</Text>
      </Group>

      {/* ── Description ── grows to push footer down ── */}
      <Text size="sm" c="dimmed" style={{ flex: 1 }} lineClamp={3}>
        {description}
      </Text>

      {/* ── Pinned footer ── */}
      <Group justify="space-between" mt="md" pt="sm" style={{ borderTop: '1px solid #f1f3f5' }}>
        <Button
          variant="outline"
          color="violet"
          size="xs"
          leftSection={<IconEdit size={14} />}
          onClick={handleUpdate}
        >
          Update
        </Button>
        <Button
          variant="subtle"
          color="red"
          size="xs"
          leftSection={<IconTrash size={14} />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Group>
    </Card>
  );
}


