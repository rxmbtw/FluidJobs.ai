const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface JobAttachment {
  attachment_id: number;
  original_name: string;
  file_path: string;
  file_type: string;
  attachment_type: string;
  uploaded_at: string;
}

export const attachmentService = {
  async getJobAttachments(jobId: string): Promise<JobAttachment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/job-attachments/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching job attachments:', error);
      return [];
    }
  }
};