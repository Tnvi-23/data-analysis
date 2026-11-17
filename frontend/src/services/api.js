import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Accept either a complete /api URL or a server origin, while ensuring every
// request uses exactly one /api prefix.
const baseURL = `${configuredBaseURL.replace(/\/+$/, '').replace(/\/api$/, '')}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true, // Automatically sends and receives HTTP-only JWT cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for uniform error parsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message === 'Network Error') {
      message = 'Unable to connect to SmartData Insight server. Ensure backend is running.';
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

// Auth Service
export const authService = {
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

// Dataset Service
export const datasetService = {
  upload: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/datasets');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/datasets/${id}`);
    return res.data;
  },
  getData: async (id, page = 1, limit = 50) => {
    const res = await api.get(`/datasets/${id}/data?page=${page}&limit=${limit}`);
    return res.data;
  },
  getIntelligence: async (id) => {
    const res = await api.get(`/datasets/${id}/intelligence`);
    return res.data;
  },
  getAudit: async (id) => {
    const res = await api.get(`/datasets/${id}/audit`);
    return res.data;
  },
  getSamples: async () => {
    const res = await api.get('/datasets/samples');
    return res.data;
  },
  loadSample: async (sampleKey) => {
    const res = await api.post(`/datasets/samples/${sampleKey}/load`);
    return res.data;
  },
  previewClean: async (id, operations) => {
    const res = await api.post(`/datasets/${id}/clean/preview`, operations);
    return res.data;
  },
  clean: async (id, operations) => {
    const res = await api.post(`/datasets/${id}/clean`, operations);
    return res.data;
  },
  undoClean: async (id) => {
    const res = await api.post(`/datasets/${id}/clean/undo`);
    return res.data;
  },
  analyze: async (id, options = {}) => {
    const res = await api.post(`/datasets/${id}/analyze`, options);
    return res.data;
  },
  explain: async (id) => {
    const res = await api.post(`/datasets/${id}/explain`);
    return res.data;
  },
  getInsights: async (id) => {
    const res = await api.get(`/datasets/${id}/insights`);
    return res.data;
  },
  compare: async (datasetId1, datasetId2) => {
    const res = await api.post('/datasets/compare', { datasetId1, datasetId2 });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/datasets/${id}`);
    return res.data;
  }
};

// Analysis Service
export const analysisService = {
  getAll: async () => {
    const res = await api.get('/analysis');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/analysis/${id}`);
    return res.data;
  },
  getByDataset: async (datasetId) => {
    const res = await api.get(`/analysis/dataset/${datasetId}`);
    return res.data;
  },
  explain: async (datasetId) => {
    const res = await api.post(`/datasets/${datasetId}/explain`);
    return res.data;
  }
};

// Report Service
export const reportService = {
  generate: async (idOrPayload, title) => {
    let payload = {};
    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
      payload = idOrPayload;
    } else {
      payload = { datasetId: idOrPayload, title };
    }
    const res = await api.post('/reports/generate', payload);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },
  getViewUrl: (reportOrId) => {
    if (typeof reportOrId === 'object' && reportOrId !== null) {
      if (reportOrId.storageType === 'cloudinary' && reportOrId.pdfUrl && reportOrId.pdfUrl.startsWith('http')) {
        return reportOrId.pdfUrl;
      }
      return `${baseURL}/reports/${reportOrId._id}/download?disposition=inline`;
    }
    return `${baseURL}/reports/${reportOrId}/download?disposition=inline`;
  },
  getDownloadUrl: (reportOrId) => {
    const id = typeof reportOrId === 'object' && reportOrId !== null ? reportOrId._id : reportOrId;
    return `${baseURL}/reports/${id}/download?disposition=attachment`;
  },
  delete: async (id) => {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  }
};

// Dashboard Service
export const dashboardService = {
  getOverview: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  }
};

// AI Gemini Assistant Service
export const aiService = {
  chat: async ({ message, datasetId, conversationId }) => {
    const res = await api.post('/ai/chat', { message, datasetId, conversationId });
    return res.data;
  },
  getStatus: async () => {
    const res = await api.get('/ai/status');
    return res.data;
  },
  getConversations: async () => {
    const res = await api.get('/ai/conversations');
    return res.data;
  },
  getConversation: async (id) => {
    const res = await api.get(`/ai/conversations/${id}`);
    return res.data;
  },
  deleteConversation: async (id) => {
    const res = await api.delete(`/ai/conversations/${id}`);
    return res.data;
  }
};

export default api;
