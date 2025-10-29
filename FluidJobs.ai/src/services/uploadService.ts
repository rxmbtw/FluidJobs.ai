// @ts-ignore
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class UploadService {
  async uploadResume(file: File): Promise<{ success: boolean; fileUrl?: string; fileName?: string }> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data as { success: boolean; fileUrl?: string; fileName?: string };
    } catch (error) {
      console.error('Error uploading resume:', error);
      return { success: false };
    }
  }
}

export default new UploadService();