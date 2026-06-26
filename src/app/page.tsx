'use client';

import { useState, useEffect } from 'react';
import { Container, SimpleGrid, Box } from '@mantine/core';
import { Navbar } from '@/components/Layout/Navbar';
import { SearchFilters } from '@/components/JobSearch/SearchFilters';
import { JobCard } from '@/components/JobList/JobCard';
import { CreateJobForm } from '@/components/CreateJob/CreateJobForm';
import { api } from '@/services/api';
import { useSearch } from '@/context/SearchContext';


// ── Types ─────────────────────────────────────────────────────────────────────

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
  applicationDeadline?: string | null;  // backend may send ISO string or null
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
  jobType: string;          // ← needed by JobCard
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_JOBS: Job[] = [];

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

// Safely coerce applicationDeadline to a string or null regardless of whether
// the backend sends an ISO string, a Date object, or nothing at all.
const toDeadlineString = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [editingJob, setEditingJob] = useState<InitialJobData | undefined>(undefined);
  const { filters } = useSearch();


  const fetchJobs = async () => {
    try {
      const response = await api.getAllJobs() as unknown as APIJob[];

      const transformedJobs: Job[] = response.map((job) => ({
        id: job.id ?? Math.floor(Math.random() * 10000),
        title: job.jobTitle,
        company: job.companyName,
        companyLogo: job.companyLogo || '',
        experience: job.experience || 'Fresher',
        locationType: job.jobType,
        jobType: job.jobType,           // ← forward raw jobType for JobCard→form seeding
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
      }));

      setJobs([...transformedJobs, ...MOCK_JOBS]);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
    }
  };


// Replace the jobs.map with filtered version:
const filteredJobs = jobs.filter(job => {
  const matchText = !filters.searchText ||
    job.title.toLowerCase().includes(filters.searchText.toLowerCase()) ||
    job.company.toLowerCase().includes(filters.searchText.toLowerCase());

  const matchLocation = !filters.location ||
    job.location.toLowerCase().includes(filters.location.toLowerCase()) ||
    job.locationType.toLowerCase().includes(filters.location.toLowerCase());

  const matchType = !filters.jobType ||
    job.jobType.toLowerCase() === filters.jobType.toLowerCase();

  // Only apply salary filter if user moved the slider from default [0, 50]
  const salaryFilterActive =
    filters.salaryRange[0] > 0 || filters.salaryRange[1] < 50;

  const matchSalary = !salaryFilterActive || (() => {
    // Convert stored paise/rupees to LPA for comparison
    const minLPA = job.salaryMin / 100000;
    const maxLPA = job.salaryMax / 100000;
    const filterMinLPA = filters.salaryRange[0];
    const filterMaxLPA = filters.salaryRange[1];
    // Job overlaps with selected range
    return minLPA <= filterMaxLPA && maxLPA >= filterMinLPA;
  })();

  return matchText && matchLocation && matchType && matchSalary;
});


  useEffect(() => { fetchJobs(); }, []);

  const { createModalOpen, closeCreateModal } = useSearch();

  const openCreateModal = () => {
    setEditingJob(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

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

        {/* JobCard update/edit flow */}
        <CreateJobForm
          opened={modalOpen}
          onClose={closeModal}
          onJobCreated={fetchJobs}
          mode={modalMode}
          initialData={editingJob}
        />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading jobs...
        </div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>
          Error: {error}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No jobs match your filters.
        </div>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing="md"
          style={{ alignItems: 'stretch' }}
        >
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              {...job}
              onDelete={fetchJobs}
              onUpdate={openUpdateModal}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  </Box>
);
}