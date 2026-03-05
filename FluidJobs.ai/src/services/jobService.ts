import { Job } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// --- Interfaces ---

export interface JobAttachment {
  attachment_id: number;
  original_name: string;
  file_path: string;
  file_type: string;
  attachment_type: string;
  uploaded_at: string;
}

export interface JobFormData {
  job_title: string;
  job_domain: string;
  job_type: string;
  locations: string[];
  mode_of_job: string;
  min_experience: number;
  max_experience: number;
  skills: string[];
  min_salary: string;
  max_salary: string;
  show_salary_to_candidate: boolean;
  job_close_days: number;
  job_description: string;
  selected_image: string;
  jd_attachment: File | null;
  eligible_courses: string[];
  eligibility_criteria: string;
  selection_process: string;
  other_details: string;
}

export interface JobDraft {
  draft_id: number;
  user_id: string;
  current_step: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// --- Helpers ---

const getAuthToken = (): string | null => {
  return sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token');
};

const getAuthHeaders = (isMultipart = false) => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// --- Service ---

export const jobService = {
  // ==========================================
  // CANDIDATE METHODS (Reading & Applying)
  // ==========================================

  async getAllJobs(): Promise<Job[]> {
    return this.getPublishedJobs();
  },

  async getPublishedJobs(): Promise<Job[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/published`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      return data.jobs.map((job: any) => ({
        id: job.id.toString(),
        title: job.title,
        company: 'FluidJobs.ai', // Default
        postedDate: new Date(job.created_at).toLocaleDateString('en-GB'),
        jobType: job.job_type,
        ctc: job.min_salary && job.max_salary
          ? `Rs.${(job.min_salary / 100000).toFixed(1)}L-Rs.${(job.max_salary / 100000).toFixed(1)}L`
          : 'Not Specified',
        industry: job.job_domain || 'Technology',
        location: Array.isArray(job.locations)
          ? job.locations.join(', ')
          : (typeof job.locations === 'string' ? job.locations.replace(/[{}\"]/g, '').split(',').map((l: string) => l.trim()).join(', ') : 'Remote'),
        description: job.description || '',
        skills: Array.isArray(job.skills) ? job.skills : [],
        companyLogo: job.selected_image,
        isEligible: true
      }));
    } catch (error) {
      console.error('Error fetching published jobs:', error);
      return [];
    }
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return null;

      const job = await response.json();
      return {
        id: job.id.toString(),
        title: job.title,
        company: 'FluidJobs.ai',
        postedDate: job.postedDate || new Date().toLocaleDateString(),
        jobType: job.employmentType || job.job_type,
        ctc: job.salaryRange,
        industry: job.industry,
        location: job.location,
        description: job.description,
        skills: job.skills,
        companyLogo: undefined
      };
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  },

  async getJobAttachments(jobId: string): Promise<JobAttachment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/job-attachments/${jobId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch attachments');
    }
    return [];
  },

  async getJobStats(): Promise<{ total: number; eligible: number; applied: number; offers: number }> {
    const jobs = await this.getAllJobs();
    return {
      total: jobs.length,
      eligible: jobs.length, // Simplified for now
      applied: 0,
      offers: 0
    };
  },

  async saveJob(jobId: string): Promise<void> {
    const numericId = parseInt(jobId);
    if (isNaN(numericId)) throw new Error('Invalid job ID');

    const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ job_id: numericId })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to save job');
    }
  },

  async unsaveJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to unsave job');
    }
  },

  async isJobSaved(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-jobs/check/${jobId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data.isSaved || false;
    } catch {
      return false;
    }
  },

  async applyForJob(jobId: string, coverLetter?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/job-applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        jobId: parseInt(jobId),
        coverLetter: coverLetter || ''
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to apply');
  },

  async publicApply(jobId: string | undefined, applicationData: any): Promise<{ success: boolean; message?: string }> {
    try {
      const formData = new FormData();
      if (jobId) formData.append('jobId', jobId);

      // Append all application data
      Object.keys(applicationData).forEach(key => {
        if (key === 'cv' && applicationData[key]) {
          formData.append('cv', applicationData[key]);
        } else if (applicationData[key] !== null && applicationData[key] !== undefined) {
          formData.append(key, applicationData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/job-applications/public-apply`, {
        method: 'POST',
        // Note: No auth headers here, and no Content-Type (let the browser set it for FormData)
        body: formData
      });

      return await response.json();
    } catch (error) {
      console.error('Error submitting public application:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async isJobApplied(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications/check/${jobId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data.hasApplied || false;
    } catch {
      return false;
    }
  },

  async getJobs(): Promise<{ success: boolean; jobs: any[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/list`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting all jobs:', error);
      return { success: false, jobs: [] };
    }
  },

  async getSavedJobs(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data.success ? data.savedJobs : [];
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      return [];
    }
  },

  async getAppliedJobs(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data.success ? data.applications : [];
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      return [];
    }
  },

  // ==========================================
  // RECRUITER METHODS (Creation & Drafts)
  // ==========================================

  getDraftUserId(): string {
    let userId = localStorage.getItem('jobFormUserId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('jobFormUserId', userId);
    }
    return userId;
  },

  async saveDraft(formData: Partial<JobFormData>, currentStep: number): Promise<{ success: boolean; draftId?: number }> {
    try {
      const userId = this.getDraftUserId();
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/draft`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, currentStep, jobData: formData })
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false };
    }
  },

  async getDraft(): Promise<{ success: boolean; draft?: JobDraft }> {
    try {
      const userId = this.getDraftUserId();
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/draft/${userId}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false };
    }
  },

  async uploadJDFile(file: File): Promise<{ success: boolean; filename?: string; originalName?: string }> {
    try {
      const formData = new FormData();
      formData.append('jdFile', file);

      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/upload-jd`, {
        method: 'POST',
        headers: getAuthHeaders(true), // isMultipart = true
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading JD:', error);
      return { success: false };
    }
  },

  async createJob(formData: JobFormData): Promise<{ success: boolean; jobId?: number; message?: string }> {
    try {
      const userId = this.getDraftUserId();
      let jdAttachmentName = null;

      if (formData.jd_attachment) {
        const uploadResult = await this.uploadJDFile(formData.jd_attachment);
        if (uploadResult.success) {
          jdAttachmentName = uploadResult.filename;
        }
      }

      const jobData = {
        ...formData,
        jd_attachment_name: jdAttachmentName,
        userId
      };

      // Remove File object (cannot be JSON stringified)
      // @ts-ignore
      delete jobData.jd_attachment;

      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData)
      });

      const result = await response.json();
      if (result.success) {
        localStorage.removeItem('jobFormUserId');
      }
      return result;

    } catch (error) {
      console.error('Error creating job:', error);
      return { success: false };
    }
  },

  async autoSave(formData: Partial<JobFormData>, currentStep: number): Promise<void> {
    if (Object.keys(formData).length > 0) {
      await this.saveDraft(formData, currentStep);
    }
  }
};