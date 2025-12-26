import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProfileCompletionContext } from '../contexts/ProfileCompletionContext';

export interface ProfileCompletionItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface ProfileCompletionData {
  items: ProfileCompletionItem[];
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
}

export const useProfileCompletion = () => {
  const { refreshTrigger } = useProfileCompletionContext();
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionData>({
    items: [],
    completionPercentage: 0,
    completedCount: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchProfileCompletion = async () => {
    setLoading(true);
    try {
      const userStr = sessionStorage.getItem('fluidjobs_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'Admin' || user.role === 'HR' || user.role === 'Sales') {
          setLoading(false);
          return;
        }
      }
      
      const token = sessionStorage.getItem('fluidjobs_token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/profile/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile: any = response.data;

      const items: ProfileCompletionItem[] = [
        {
          id: 'fullName',
          label: 'Full Name',
          completed: !!(profile.full_name?.trim()),
          required: true
        },
        {
          id: 'email',
          label: 'Email Address',
          completed: !!(profile.email?.trim()),
          required: true
        },
        {
          id: 'phone',
          label: 'Phone Number',
          completed: (() => {
            const phone = profile.phone?.trim() || profile.phone_number?.trim() || '';
            return !!(phone && phone.includes('+') && phone.length > 4 && /\d{7,}/.test(phone));
          })(),
          required: true
        },
        {
          id: 'profileImage',
          label: 'Upload profile picture',
          completed: !!(profile.profile_image_url?.trim()),
          required: false
        },
        {
          id: 'resume',
          label: 'Upload resume',
          completed: !!(profile.resume_files && Array.isArray(profile.resume_files) && profile.resume_files.length > 0),
          required: false
        },
        {
          id: 'address',
          label: 'Add your address',
          completed: !!(profile.city?.trim() || profile.location?.trim()),
          required: false
        },
        {
          id: 'gender',
          label: 'Gender',
          completed: !!(profile.gender?.trim() && profile.gender !== 'Select Gender'),
          required: false
        },
        {
          id: 'maritalStatus',
          label: 'Marital Status',
          completed: !!(profile.marital_status?.trim() && profile.marital_status !== 'Select Status'),
          required: false
        },
        {
          id: 'workStatus',
          label: 'Work Experience',
          completed: !!(profile.work_status?.trim()),
          required: true
        },
        ...(profile.work_status?.trim() === 'fresher' ? [
          {
            id: 'college',
            label: 'College/University',
            completed: !!(profile.college?.trim()),
            required: false
          }
        ] : [
          {
            id: 'currentCompany',
            label: 'Current/Last Company',
            completed: !!(profile.current_company?.trim() || profile.last_company?.trim()),
            required: false
          }
        ]),
        {
          id: 'workMode',
          label: 'Work Mode Preference',
          completed: !!(profile.work_mode?.trim() && profile.work_mode !== 'Select Work Mode'),
          required: false
        }
      ];

      const completedCount = items.filter(item => item.completed).length;
      const totalCount = items.length;
      const completionPercentage = Math.round((completedCount / totalCount) * 100);

      const sortedItems = items.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });

      setProfileCompletion({
        items: sortedItems,
        completionPercentage,
        completedCount,
        totalCount
      });
    } catch (error: any) {
      console.error('Error fetching profile completion:', error);
      if (error.response?.status === 401) {
        sessionStorage.removeItem('fluidjobs_token');
        sessionStorage.removeItem('fluidjobs_user');
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileCompletion();
  }, [refreshTrigger]);

  return {
    profileCompletion,
    loading,
    refreshProfileCompletion: fetchProfileCompletion
  };
};