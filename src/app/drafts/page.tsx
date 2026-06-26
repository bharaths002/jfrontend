'use client';

import { useState, useEffect } from 'react';
import { Container, SimpleGrid, Box, Text } from '@mantine/core';
import { JobCard } from '@/components/JobList/JobCard';
import { CreateJobForm } from '@/components/CreateJob/CreateJobForm';
import { api } from '@/services/api';
import { useSearch } from '@/context/SearchContext';

interface APIJob {
  id: number;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobType: string;
  experience: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobDescription: string;
  requirements: string;
  responsibilities: string;
  applicationDeadline?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

type InitialJobData = {
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
};

const formatRelativeTime = (dateString?: string | null): string => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const posted = new Date(dateString);
  if (isNaN(posted.getTime())) return 'Just now';
  const diffInMs = now.getTime() - posted.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
};

export default function DraftsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [editingJob, setEditingJob] = useState<InitialJobData | undefined>();
  const { filters ,createModalOpen,closeCreateModal} = useSearch();

  const fetchDrafts = async () => {
    try {
      const response = await api.getDraftJobs() as unknown as APIJob[];
      const drafts = response
        .map(job => ({
          id: job.id,
          title: job.jobTitle,
          company: job.companyName,
          companyLogo: job.companyLogo || '',
          experience: job.experience || 'Fresher',
          locationType: job.jobType,
          jobType: job.jobType,
          location: job.location || '',
          salary: `₹${(job.salaryMin / 100000).toFixed(1)}–${(job.salaryMax / 100000).toFixed(1)} LPA`,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          description: job.jobDescription,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          applicationDeadline: job.applicationDeadline ?? null,
          status: job.status,
          postedTime: formatRelativeTime(job.updatedAt || job.createdAt),
        }));
      setJobs(drafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, []);

  const openUpdateModal = (jobData: InitialJobData) => {
    setEditingJob(jobData);
    setModalMode('update');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setEditingJob(undefined), 300);
  };

const filteredJobs = jobs.filter(job => {
    const matchText = !filters.searchText ||
      job.title.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.searchText.toLowerCase());

    const matchLocation = !filters.location ||
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchType = !filters.jobType ||
      job.jobType.toLowerCase() === filters.jobType.toLowerCase();

    const salaryFilterActive =
      filters.salaryRange[0] > 0 || filters.salaryRange[1] < 50;

    const matchSalary = !salaryFilterActive || (() => {
      const minLPA = job.salaryMin / 100000;
      const maxLPA = job.salaryMax / 100000;
      return minLPA <= filters.salaryRange[1] && maxLPA >= filters.salaryRange[0];
    })();

    return matchText && matchLocation && matchType && matchSalary;
  });

  return (
    <Box style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <Text fw={700} size="xl" mb="lg" c="violet.7">Saved Drafts</Text>

               {/* Navbar "Create Jobs" button */}
        <CreateJobForm
          opened={createModalOpen}
          onClose={closeCreateModal}
          onJobCreated={fetchDrafts}
          mode="create"
        />

        {/* JobCard update flow */}
        <CreateJobForm
          opened={modalOpen}
          onClose={closeModal}
          onJobCreated={fetchDrafts}
          mode={modalMode}
          initialData={editingJob}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading drafts...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No drafts found.
          </div>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                {...job}
                onDelete={fetchDrafts}
                onUpdate={openUpdateModal}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}





