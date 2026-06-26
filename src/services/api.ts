interface APIJob {
  id: number;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  experience: string;
  salaryMin: number;
  salaryMax: number;
  jobDescription: string;
  requirements: string;
  responsibilities: string;
  applicationDeadline: Date;
  status: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
}

interface CreateJobPayload extends Omit<APIJob, "id" | "companyLogo"> {
  companyLogo?: File | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = {
  // ── GET /jobs (published only) ──────────────────────────────────────────
  async getAllJobs(): Promise<APIJob[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const responseData = await response.json();
      return (
        Array.isArray(responseData?.data) ? responseData.data : responseData
      ).map((job: { applicationDeadline: number | Date; companyLogo?: string }) => ({
        ...job,
        applicationDeadline: new Date(job.applicationDeadline),
        // Cloudinary URLs start with https — don't prepend API_BASE_URL to them
        companyLogo: job.companyLogo
          ? job.companyLogo.startsWith('http')
            ? job.companyLogo
            : `${API_BASE_URL}${job.companyLogo}`
          : undefined,
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },

  // ── GET /jobs/drafts ────────────────────────────────────────────────────
  async getDraftJobs(): Promise<APIJob[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/drafts`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const responseData = await response.json();
      return (
        Array.isArray(responseData?.data) ? responseData.data : responseData
      ).map((job: { applicationDeadline: number | Date; companyLogo?: string }) => ({
        ...job,
        applicationDeadline: new Date(job.applicationDeadline),
        companyLogo: job.companyLogo
          ? job.companyLogo.startsWith('http')
            ? job.companyLogo
            : `${API_BASE_URL}${job.companyLogo}`
          : undefined,
      }));
    } catch (error) {
      console.error("Error fetching drafts:", error);
      throw error;
    }
  },

  // ── POST /jobs ──────────────────────────────────────────────────────────
  async createJob(
    jobData: CreateJobPayload,
  ): Promise<{ success: boolean; message: string; job?: APIJob }> {
    try {
      const formData = new FormData();
      formData.append("jobTitle", jobData.jobTitle);
      formData.append("companyName", jobData.companyName);
      formData.append("location", jobData.location);
      formData.append("jobType", jobData.jobType);
      formData.append("experience", jobData.experience);
      formData.append("salaryMin", String(jobData.salaryMin));
      formData.append("salaryMax", String(jobData.salaryMax));
      formData.append("jobDescription", jobData.jobDescription);
      formData.append("requirements", jobData.requirements);
      formData.append("responsibilities", jobData.responsibilities);
      formData.append("status", jobData.status);
      formData.append(
        "applicationDeadline",
        jobData.applicationDeadline instanceof Date
          ? jobData.applicationDeadline.toISOString()
          : new Date(jobData.applicationDeadline).toISOString(),
      );
      if (jobData.companyLogo instanceof File) {
        formData.append("companyLogo", jobData.companyLogo);
      }

      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: responseData?.message || `Failed to create job: ${response.status}`,
        };
      }

      return {
        success: true,
        message:
          jobData.status === "published"
            ? "Job published successfully!"
            : "Job saved to draft successfully!",
        job: responseData.data ?? responseData,
      };
    } catch (error) {
      console.error("Error creating job:", error);
      return {
        success: false,
        message: "Failed to create job: " + (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },

  // ── PATCH /jobs/:id ─────────────────────────────────────────────────────
  async updateJob(
    id: number,
    data: Record<string, unknown>,
  ): Promise<{ success: boolean; data?: APIJob }> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'companyLogo' && value instanceof File) {
          formData.append('companyLogo', value);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message ?? 'Failed to update job');
      }

      const result = await response.json();
      return { success: result.status === 'success', data: result.data };
    } catch (error) {
      console.error("Error updating job:", error);
      return { success: false };
    }
  },

  // ── DELETE /jobs/:id ────────────────────────────────────────────────────
  async deleteJob(jobId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          message: errorData?.message || `Failed to delete job: ${response.status}`,
        };
      }

      return { success: true, message: "Job deleted successfully!" };
    } catch (error) {
      console.error("Error deleting job:", error);
      return {
        success: false,
        message: "Error deleting job: " + (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
};