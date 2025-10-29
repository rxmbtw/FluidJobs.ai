// @ts-ignore
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
  [key: string]: any; // For all the job form fields
}

class JobsEnhancedService {
  private getUserId(): string {
    // Generate or get user session ID
    let userId = localStorage.getItem('jobFormUserId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('jobFormUserId', userId);
    }
    return userId;
  }

  async saveDraft(formData: Partial<JobFormData>, currentStep: number): Promise<{ success: boolean; draftId?: number }> {
    try {
      const userId = this.getUserId();
      
      const response = await axios.post(`${API_BASE_URL}/api/jobs-enhanced/draft`, {
        userId,
        currentStep,
        jobData: formData
      });

      return response.data as { success: boolean; draftId?: number };
    } catch (error) {
      console.error('Error saving job draft:', error);
      return { success: false };
    }
  }

  async getDraft(): Promise<{ success: boolean; draft?: JobDraft }> {
    try {
      const userId = this.getUserId();
      
      const response = await axios.get(`${API_BASE_URL}/api/jobs-enhanced/draft/${userId}`);
      return response.data as { success: boolean; draft?: JobDraft };
    } catch (error) {
      console.error('Error fetching job draft:', error);
      return { success: false };
    }
  }

  async uploadJDFile(file: File): Promise<{ success: boolean; filename?: string; originalName?: string }> {
    try {
      const formData = new FormData();
      formData.append('jdFile', file);

      const response = await axios.post(`${API_BASE_URL}/api/jobs-enhanced/upload-jd`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data as { success: boolean; filename?: string; originalName?: string };
    } catch (error) {
      console.error('Error uploading JD file:', error);
      return { success: false };
    }
  }

  async createJob(formData: JobFormData): Promise<{ success: boolean; jobId?: number; message?: string }> {
    try {
      const userId = this.getUserId();
      
      // Upload JD file if present
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
        userId // Include for cleanup
      };

      // Remove the File object before sending to API
      delete (jobData as any).jd_attachment;

      const response = await axios.post(`${API_BASE_URL}/api/jobs-enhanced/create`, jobData);
      
      // Clear user session after successful job creation
      localStorage.removeItem('jobFormUserId');
      
      return response.data as { success: boolean; jobId?: number; message?: string };
    } catch (error) {
      console.error('Error creating job:', error);
      return { success: false };
    }
  }

  async getJobs(): Promise<{ success: boolean; jobs?: any[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jobs-enhanced/list`);
      return response.data as { success: boolean; jobs?: any[] };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { success: false };
    }
  }

  async getJob(jobId: number): Promise<{ success: boolean; job?: any }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jobs-enhanced/${jobId}`);
      return response.data as { success: boolean; job?: any };
    } catch (error) {
      console.error('Error fetching job:', error);
      return { success: false };
    }
  }

  // Auto-save functionality
  async autoSave(formData: Partial<JobFormData>, currentStep: number): Promise<void> {
    // Debounced auto-save - only save if there's actual data
    if (Object.keys(formData).length > 0) {
      await this.saveDraft(formData, currentStep);
    }
  }
}

export default new JobsEnhancedService();