'use client';

import { Card, Text, Group, Button, Box, Badge, Stack, Image } from '@mantine/core';
import { IconTrash, IconEdit } from '@tabler/icons-react';
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
          {companyLogo ? (
            <Image src={companyLogo} alt={company} width={35} height={35} fit="contain" />
          ) : (
            <Text fw={700} size="lg" c="violet">
              {company.charAt(0).toUpperCase()}
            </Text>
          )}
        </Box>
        <Badge color="blue" variant="light" size="sm">{postedTime}</Badge>
      </Group>

      {/* ── Title + company ── */}
      <Stack gap={5} mb="md">
        <Text fw={600} size="lg" lineClamp={2}>{title}</Text>
        <Text size="sm" c="dimmed">{company}</Text>
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



// 'use client';

// import { Card, Text, Group, Button, Box, Badge, Stack, Image } from '@mantine/core';
// import { IconTrash } from '@tabler/icons-react';
// import { api } from '@/services/api';

// interface JobCardProps {
//   id: number;
//   title: string;
//   company: string;
//   companyLogo?: string;
//   experience: string;
//   locationType: string;
//   salary: string;
//   description: string;
//   requirements: string;
//   responsibilities: string;
//   postedTime: string;
//   onDelete: () => void;
// }

// export function JobCard({
//   id,
//   title,
//   company,
//   companyLogo,
//   experience,
//   locationType,
//   salary,
//   description,
//   requirements,
//   responsibilities,
//   postedTime,
//   onDelete,
// }: JobCardProps) {
//   const handleDelete = async () => {
//     try {
//       await api.deleteJob(id);
//       onDelete();
//     } catch (error) {
//       console.error('Error deleting job:', error);
//     }
//   };

//   return (
//     <Card
//       shadow="sm"
//       padding="lg"
//       radius="md"
//       withBorder
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',           // fills the SimpleGrid cell
//       }}
//     >
//       {/* ── Top: logo + badge ── */}
//       <Group justify="space-between" align="flex-start" mb="xs">
//         <Box
//           style={{
//             width: 45,
//             height: 45,
//             borderRadius: 8,
//             overflow: 'hidden',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: '#f8f9fa',
//             flexShrink: 0,
//           }}
//         >
//           {companyLogo ? (
//             <Image src={companyLogo} alt={company} width={35} height={35} fit="contain" />
//           ) : (
//             <Text fw={700} size="lg" c="violet">
//               {company.charAt(0).toUpperCase()}
//             </Text>
//           )}
//         </Box>
//         <Badge color="blue" variant="light" size="sm">
//           {postedTime}
//         </Badge>
//       </Group>

//       {/* ── Title + company ── */}
//       <Stack gap={5} mb="md">
//         <Text fw={600} size="lg" lineClamp={2}>
//           {title}
//         </Text>
//         <Text size="sm" c="dimmed">
//           {company}
//         </Text>
//       </Stack>

//       {/* ── Meta pills ── */}
//       <Group gap={8} mb="md" wrap="wrap">
//         <Text size="sm" c="dimmed">{experience}</Text>
//         <Text size="sm" c="dimmed">•</Text>
//         <Text size="sm" c="dimmed">{locationType}</Text>
//         <Text size="sm" c="dimmed">•</Text>
//         <Text size="sm" c="dimmed">{salary}</Text>
//       </Group>

//       {/* ── Description — grows to push footer down ── */}
//       <Text size="sm" c="dimmed" style={{ flex: 1 }} lineClamp={3}>
//         {description}
//       </Text>

//       {/* ── Pinned footer ── */}
//       <Group
//         justify="space-between"
//         mt="md"
//         pt="sm"
//         style={{ borderTop: '1px solid #f1f3f5' }}
//       >
//         <Button
//           variant="outline"
//           color="violet"
//           size="xs"
//           fw={700}
//         >
//           Update
//         </Button>

//         <Button
//           variant="subtle"
//           color="red"
//           size="xs"
//           leftSection={<IconTrash size={14} />}
//           onClick={handleDelete}
//         >
//           Delete
//         </Button>
//       </Group>
//     </Card>
//   );
// }