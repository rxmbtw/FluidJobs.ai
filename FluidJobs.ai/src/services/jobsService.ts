import { Job } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthToken = (): string | null => {
  return sessionStorage.getItem('fluidjobs_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const jobsService = {
  // Fetch all published jobs
  getPublishedJobs: async (): Promise<Job[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/published`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      console.log('=== GET PUBLISHED JOBS ===');
      console.log('Response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
      
      // Transform backend data to frontend format
      const transformedJobs = data.jobs.map((job: any) => {
        const jobId = job.id.toString();
        console.log('Job ID:', jobId, 'Type:', typeof job.id);
        return {
          id: jobId,
          title: job.title,
          postedDate: new Date(job.created_at).toLocaleDateString('en-GB'),
          jobType: job.job_type,
          ctc: job.min_salary && job.max_salary 
            ? `Rs.${(job.min_salary/100000).toFixed(1)}L-Rs.${(job.max_salary/100000).toFixed(1)}L`
            : 'Not Specified',
          industry: job.job_domain || 'Technology',
          location: Array.isArray(job.locations) 
            ? job.locations.join(', ') 
            : (typeof job.locations === 'string' ? job.locations.replace(/[{}\"]/g, '').split(',').map((l: string) => l.trim()).join(', ') : 'Remote'),
          description: job.description || 'Join our team and contribute to exciting projects.',
          skills: Array.isArray(job.skills) ? job.skills : [],
          companyLogo: job.selected_image,
          matchScore: undefined
        };
      });
      
      console.log('Transformed jobs count:', transformedJobs.length);
      return transformedJobs;
    } catch (error) {
      console.error('Error fetching published jobs:', error);
      throw error;
    }
  },

  // Fetch job by ID
  getJobById: async (jobId: string): Promise<Job | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs-enhanced/${jobId}`, {
        headers: getAuthHeaders()
      });
      const job = await response.json();
      
      return {
        id: job.id.toString(),
        title: job.title,
        postedDate: job.postedDate,
        jobType: job.employmentType,
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

  // Save job
  saveJob: async (jobId: string): Promise<void> => {
    try {
      const token = getAuthToken();
      console.log('=== SAVE JOB DEBUG ===');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      console.log('Saving job with ID:', jobId);
      
      // Extract numeric ID if it's a string like "FLC9602989613" or just use the number
      let numericJobId: number;
      if (typeof jobId === 'string' && jobId.startsWith('FLC')) {
        // This is a custom ID format, we need to find the actual database ID
        console.error('Custom job ID format detected:', jobId);
        console.error('Cannot save job with custom ID format. Need numeric ID.');
        throw new Error('Invalid job ID format');
      } else {
        numericJobId = parseInt(jobId);
      }
      
      if (isNaN(numericJobId)) {
        throw new Error('Invalid job ID');
      }
      
      const payload = { job_id: numericJobId };
      console.log('Request payload:', payload);
      console.log('API URL:', `${API_BASE_URL}/saved-jobs`);
      
      const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Save job response:', data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to save job');
      }
      
      console.log('Job saved successfully!');
    } catch (error: any) {
      console.error('Error saving job:', error);
      throw new Error(error.message || 'Failed to save job. Please try again.');
    }
  },

  // Unsave job
  unsaveJob: async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to unsave job');
      }
    } catch (error: any) {
      console.error('Error unsaving job:', error);
      throw new Error(error.message || 'Failed to unsave job. Please try again.');
    }
  },

  // Get saved jobs
  getSavedJobs: async (): Promise<Job[]> => {
    try {
      console.log('=== GET SAVED JOBS DEBUG ===');
      console.log('API URL:', `${API_BASE_URL}/saved-jobs`);
      
      const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
        headers: getAuthHeaders()
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.warn('Failed to fetch saved jobs, returning empty array');
        return [];
      }
      
      const data = await response.json();
      console.log('Saved jobs response:', data);
      
      if (!data.success) {
        console.warn('Failed to fetch saved jobs:', data.error);
        return [];
      }
      
      console.log('Number of saved jobs:', data.savedJobs?.length || 0);
      
      // Transform saved jobs to Job format
      const transformedJobs = data.savedJobs.map((saved: any) => ({
        id: saved.job_id.toString(),
        title: saved.title,
        postedDate: new Date(saved.created_at).toLocaleDateString('en-GB'),
        jobType: saved.job_type,
        ctc: saved.min_salary && saved.max_salary 
          ? `Rs.${(saved.min_salary/100000).toFixed(1)}L-Rs.${(saved.max_salary/100000).toFixed(1)}L`
          : 'Not Specified',
        industry: saved.job_domain || 'Technology',
        location: Array.isArray(saved.locations) 
          ? saved.locations.join(', ') 
          : (typeof saved.locations === 'string' ? saved.locations.replace(/[{}\"]/g, '').split(',').map((l: string) => l.trim()).join(', ') : 'Remote'),
        description: saved.description || 'Join our team and contribute to exciting projects.',
        skills: Array.isArray(saved.skills) ? saved.skills : [],
        companyLogo: saved.selected_image
      }));
      
      console.log('Transformed jobs:', transformedJobs);
      return transformedJobs;
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      return [];
    }
  },

  // Check if job is saved
  isJobSaved: async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-jobs/check/${jobId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data.isSaved || false;
    } catch (error) {
      console.error('Error checking saved status:', error);
      return false;
    }
  },

  // Apply for job
  applyForJob: async (jobId: string, coverLetter?: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          jobId: parseInt(jobId),
          coverLetter: coverLetter || ''
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to apply for job');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },

  // Get applied jobs
  getAppliedJobs: async (): Promise<Job[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch applications');
      }
      
      // Transform applications to job format
      return data.applications.map((app: any) => ({
        id: app.job_id.toString(),
        title: app.job_title,
        postedDate: new Date(app.applied_at).toLocaleDateString('en-GB'),
        jobType: app.job_type,
        ctc: app.min_salary && app.max_salary 
          ? `Rs.${(app.min_salary/100000).toFixed(1)}L-Rs.${(app.max_salary/100000).toFixed(1)}L`
          : 'Not Specified',
        industry: app.job_domain || 'Technology',
        location: Array.isArray(app.locations) 
          ? app.locations.join(', ') 
          : (typeof app.locations === 'string' ? app.locations.replace(/[{}\"]/g, '').split(',').map((l: string) => l.trim()).join(', ') : 'Remote'),
        description: app.description || 'Join our team and contribute to exciting projects.',
        skills: Array.isArray(app.skills) ? app.skills : [],
        companyLogo: app.selected_image,
        applicationStatus: app.status
      }));
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      return [];
    }
  },

  // Check if applied
  isJobApplied: async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-applications/check/${jobId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data.hasApplied || false;
    } catch (error) {
      console.error('Error checking application status:', error);
      return false;
    }
  }
};
