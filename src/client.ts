import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

export type LoginPayload = {
  email: string;
  password: string;
};
export const authClient = {
  csrf: () => api.get("/sanctum/csrf-cookie"),
  login: (data: LoginPayload) => api.post("/login", data),
  logout: () => api.post("/logout"),
};

export type Document = {
  id: number;
  name: string;
  expires_at: string;
  archived_at: string | null;
};
export const documentsClient = {
  getDocuments: (params?: { filter?: string; sort?: string }) =>
    api.get<{ data: Document[] }>("/documents", {
      params,
    }),
  getDocument: (id: number) => api.get<{ data: Document }>(`/documents/${id}`),
  renameDocument: (id: number, name: string) =>
    api.patch(`/documents/${id}`, { name }),
  archiveDocument: (id: number) => api.post(`/documents/${id}/archive`),
  createDocument: (data: FormData) =>
    api.post("/documents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
