import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export interface DatabaseCandidate {
  candidate_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  gender: string;
  marital_status: string;
  current_company: string;
  notice_period: string;
  current_ctc: string;
  location: string;
  currently_employed: string;
  previous_company: string;
  expected_ctc: string;
  experience_years: number;
  created_at: string;
  resume_score: number;
}

export interface CandidateResponse {
  status: string;
  data: {
    candidates: DatabaseCandidate[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCandidates: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface CandidateStats {
  status: string;
  data: {
    totalCandidates: number;
    employedCandidates: number;
    fresherCandidates: number;
    averageExperience: string;
    topLocations: Array<{ location: string; count: string }>;
  };
}

export const candidateService = {
  async getCandidates(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<CandidateResponse> {
    const response = await axios.get(`${API_BASE_URL}/api/candidates`, { params });
    return response.data as CandidateResponse;
  },

  async getCandidateById(id: string): Promise<{ status: string; data: DatabaseCandidate }> {
    const response = await axios.get(`${API_BASE_URL}/api/candidates/${id}`);
    return response.data as { status: string; data: DatabaseCandidate };
  },

  async getCandidateStats(): Promise<CandidateStats> {
    const response = await axios.get(`${API_BASE_URL}/api/candidates/stats/overview`);
    return response.data as CandidateStats;
  }
};