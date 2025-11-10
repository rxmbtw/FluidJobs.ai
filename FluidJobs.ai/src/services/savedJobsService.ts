import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface SavedJob {
  id: number;
  job_id: number;
  candidate_id: string;
  saved_at: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range: string;
}

class SavedJobsService {
  private getAuthHeaders() {
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getSavedJobs(): Promise<SavedJob[]> {
    try {
      const response = await axios.get(`${API_URL}/api/saved-jobs`, this.getAuthHeaders());
      return response.data as SavedJob[];
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      throw error;
    }
  }

  async saveJob(jobId: number): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/saved-jobs`, { jobId }, this.getAuthHeaders());
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  async unsaveJob(jobId: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/saved-jobs/${jobId}`, this.getAuthHeaders());
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  }

  async isJobSaved(jobId: number): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/api/saved-jobs/check/${jobId}`, this.getAuthHeaders());
      return (response.data as { isSaved: boolean }).isSaved;
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      return false;
    }
  }
}

export default new SavedJobsService();