const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const profileService = {
  async uploadProfileImage(file: File): Promise<{ success: boolean; fileUrl: string }> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    
    console.log('Uploading profile image to:', `${API_BASE_URL}/api/upload/profile-image`);
    
    const response = await fetch(`${API_BASE_URL}/api/profile/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile image upload failed:', errorText);
      throw new Error('Failed to upload profile image');
    }

    const result = await response.json();
    console.log('Profile image upload result:', result);
    return result;
  },

  async uploadCoverImage(file: File): Promise<{ success: boolean; fileUrl: string }> {
    const formData = new FormData();
    formData.append('coverImage', file);

    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    
    const response = await fetch(`${API_BASE_URL}/api/profile/upload-cover-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload cover image');
    }

    return response.json();
  },

  async uploadResume(file: File): Promise<{ success: boolean; fileUrl: string; resume: any }> {
    const formData = new FormData();
    formData.append('resume', file);

    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    
    console.log('Uploading resume to:', `${API_BASE_URL}/api/upload/resume`);
    
    const response = await fetch(`${API_BASE_URL}/api/profile/upload-resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resume upload failed:', errorText);
      throw new Error('Failed to upload resume');
    }

    const result = await response.json();
    console.log('Resume upload result:', result);
    return result;
  },

  async getProfile(): Promise<any> {
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    
    console.log('GET Profile - Token exists:', !!token);
    
    const response = await fetch(`${API_BASE_URL}/api/profile/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('GET Profile - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GET Profile Error:', errorText);
      throw new Error('Failed to get profile');
    }

    const profileData = await response.json();
    console.log('GET Profile Data:', profileData);
    return profileData;
  },

  async saveProfile(profileData: any): Promise<{ success: boolean; message: string; profile: any }> {
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    
    console.log('=== SAVE PROFILE DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Profile data:', profileData);
    
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/profile/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Save result:', result);
    return result;
  }
};