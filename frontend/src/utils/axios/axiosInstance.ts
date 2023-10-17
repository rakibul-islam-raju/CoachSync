import axios from "axios";
import { BASE_API_URL } from "../../config";

let access: string | null = null;
let refresh: string | null = null;

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "Application/json",
  },
});

// interceptors
axiosInstance.interceptors.request.use(
  async req => {
    const authDataString = localStorage.getItem("cms_auth");
    if (authDataString) {
      const authData: {
        access: string;
        refresh: string;
      } = JSON.parse(authDataString);
      access = authData.access;
      refresh = authData.refresh;
    }

    if (access) {
      req.headers.Authorization = `Bearer ${access}`;
      return req;
    }
    return req;
    // else {
    //   localStorage.removeItem("cms_auth");
    //   return Promise.reject(new Error("Access token is missing"));
    // }
  },

  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${BASE_API_URL}/auth/refresh`, {
          refresh: refresh,
        });

        localStorage.setItem("cms_auth", JSON.stringify(data));

        originalRequest.headers.Authorization = `Bearer ${data?.access}`;

        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("cms_auth");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
