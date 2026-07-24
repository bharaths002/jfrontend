'use client';

import { useState, useEffect } from 'react';
import { Container, SimpleGrid, Box } from '@mantine/core';
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

interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  experience: string;
  locationType: string;
  jobType: string;
  location: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  responsibilities: string;
  applicationDeadline?: string | null;
  status?: string;
  postedTime: string;
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
  const diff = now.getTime() - posted.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const toDeadlineString = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [editingJob, setEditingJob] = useState<InitialJobData | undefined>(undefined);
  const { filters, createModalOpen, closeCreateModal } = useSearch();

  const fetchJobs = async () => {
    try {
      const response = await api.getAllJobs() as unknown as APIJob[];
      setJobs(response.map((job) => ({
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
        applicationDeadline: toDeadlineString(job.applicationDeadline),
        status: job.status,
        postedTime: formatRelativeTime(job.updatedAt || job.createdAt),
      })));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = jobs.filter(job => {
    const matchText = !filters.searchText ||
      job.title.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchLocation = !filters.location ||
      job.location.toLowerCase().includes(filters.location.toLowerCase()) ||
      job.locationType.toLowerCase().includes(filters.location.toLowerCase());
    const matchType = !filters.jobType ||
      job.jobType.toLowerCase() === filters.jobType.toLowerCase();
    const salaryActive = filters.salaryRange[0] > 0 || filters.salaryRange[1] < 50;
    const matchSalary = !salaryActive || (() => {
      const minLPA = job.salaryMin / 100000;
      const maxLPA = job.salaryMax / 100000;
      return minLPA <= filters.salaryRange[1] && maxLPA >= filters.salaryRange[0];
    })();
    return matchText && matchLocation && matchType && matchSalary;
  });

  const openUpdateModal = (jobData: InitialJobData) => {
    setEditingJob(jobData);
    setModalMode('update');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setEditingJob(undefined), 300);
  };

  return (
    <Box style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <CreateJobForm
          opened={createModalOpen}
          onClose={closeCreateModal}
          onJobCreated={fetchJobs}
          mode="create"
        />
        <CreateJobForm
          opened={modalOpen}
          onClose={closeModal}
          onJobCreated={fetchJobs}
          mode={modalMode}
          initialData={editingJob}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading jobs...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>Error: {error}</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No jobs match your filters.</div>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md" style={{ alignItems: 'stretch' }}>
            {filteredJobs.map((job) => (
              <JobCard key={job.id} {...job} onDelete={fetchJobs} onUpdate={openUpdateModal} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}