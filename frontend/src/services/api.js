import axios from 'axios';

// Demo mode: when VITE_API_URL is not set, all API calls use mock data
// so the demo works without a deployed backend.
const IS_DEMO = !import.meta.env.VITE_API_URL;
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, attempt token refresh; if that fails, force logout
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Demo mock data ──────────────────────────────────────────────

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@careeriq.com',
  username: 'demouser',
  full_name: 'Demo User',
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function demoRegister(payload) {
  return Promise.resolve({
    data: {
      message: 'User registered successfully',
      user: { ...DEMO_USER, email: payload.email, username: payload.username, full_name: payload.full_name },
      tokens: { access_token: 'demo-access-token', refresh_token: 'demo-refresh-token', token_type: 'bearer' },
    },
  });
}

function demoLogin() {
  return Promise.resolve({
    data: {
      message: 'Login successful',
      user: DEMO_USER,
      tokens: { access_token: 'demo-access-token', refresh_token: 'demo-refresh-token', token_type: 'bearer' },
    },
  });
}

function demoGetMe() {
  return Promise.resolve({ data: DEMO_USER });
}

function demoAnalysisResult() {
  return {
    id: 'demo-1',
    ats_score: 78.5,
    ats_breakdown: {
      keyword_match: 72, skills_alignment: 80, experience_relevance: 75, format_quality: 85,
      strengths: ['Strong technical background', 'Clear career progression'],
      weaknesses: ['Missing some keywords', 'Format could be improved'],
      keyword_suggestions: ['Kubernetes', 'AWS', 'Microservices'],
    },
    missing_skills: ['Kubernetes', 'AWS Lambda', 'Microservices Architecture'],
    resume_suggestions: ['Add quantifiable achievements', 'Include a summary section', 'Use more action verbs'],
    cover_letter: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the position...\n\nBest regards,\nDemo User',
    interview_questions: ['Tell me about yourself', 'Why do you want this role?', 'Describe a challenging project'],
    hr_questions: ['What are your salary expectations?', 'Why are you leaving your current role?'],
    technical_questions: ['Explain REST APIs', 'How would you design a scalable system?'],
    career_suggestions: ['Consider cloud certifications', 'Build a portfolio project'],
    learning_roadmap: ['Learn Docker & Kubernetes', 'Study system design', 'Practice coding interviews'],
    skill_gap_analysis: 'Your resume shows strong fundamentals but lacks cloud-native technologies.',
    resume_filename: 'resume.pdf',
    job_title: 'Senior Software Engineer',
    company: 'Tech Corp',
    job_description: 'Looking for a senior engineer...',
    created_at: new Date().toISOString(),
  };
}

function demoAnalysisList() {
  return [demoAnalysisResult()];
}

// ─── Auth API calls ───────────────────────────────────────────────

export const authApi = {
  register: (payload) => IS_DEMO ? demoRegister(payload) : api.post('/auth/register', payload),
  login: (payload) => IS_DEMO ? demoLogin(payload) : api.post('/auth/login', payload),
  refresh: (refreshToken) => IS_DEMO ? Promise.reject(new Error('No refresh in demo')) : api.post('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => IS_DEMO ? demoGetMe() : api.get('/auth/me'),
  updateProfile: (payload) => IS_DEMO ? Promise.resolve({ data: { ...DEMO_USER, ...payload } }) : api.put('/auth/profile', payload),
};

// ─── Analysis API calls ───────────────────────────────────────────

export const analysisApi = {
  upload: (formData) => IS_DEMO ? Promise.resolve({ data: demoAnalysisResult() }) : api.post('/analysis/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  history: (skip = 0, limit = 20) => IS_DEMO ? Promise.resolve({ data: { analyses: demoAnalysisList(), total: 1 } }) : api.get('/analysis/history', { params: { skip, limit } }),
  getById: (id) => IS_DEMO ? Promise.resolve({ data: { id, ...demoAnalysisResult() } }) : api.get(`/analysis/${id}`),
  delete: (id) => IS_DEMO ? Promise.resolve() : api.delete(`/analysis/${id}`),
};

export default api;
