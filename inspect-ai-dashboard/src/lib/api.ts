import axios from "axios";

const API_BASE_URL = "https://visionguard-ai-inspection.onrender.com"; // Replace with your backend API URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
