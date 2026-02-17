import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    const response = await api.post("/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },
};

export const registerApi = {
  register: async (username: string, password: string) => {
    const response = await api.post("/register", {
      username,
      password,
    });
    return response.data;
  },
};

export const analyticsApi = {
  getAnalytics: async (objectId: string) => {
    const response = await api.get(`/objects/${objectId}/analytics`);
    return response.data;
  },
};

export const objectsApi = {
  create: async (name: string) => {
    const response = await api.post(`/objects?name=${encodeURIComponent(name)}`);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/objects");
    return response.data;
  },
};

export const inspectionApi = {
  inspectSingle: async (objectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/objects/${objectId}/inspect`, formData, {
      responseType: "blob",
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      blob: response.data,
      score: response.headers["x-anomaly-score"],
      result: response.headers["x-result"],
    };
  },
  inspectBatch: async (objectId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await api.post(`/objects/${objectId}/inspect-batch`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getHistory: async (objectId: string) => {
    const response = await api.get(`/objects/${objectId}/history`);
    return response.data;
  },
};

export const trainApi = {
  trainObject: async (objectId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const response = await api.post(
      `/objects/${objectId}/train`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  },
};

export default api;
