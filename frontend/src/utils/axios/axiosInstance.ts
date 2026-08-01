import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { BASE_API_URL } from "../../config";
import { localStorageServices } from "../../services/localStorageService";

type AuthTokens = {
  access: string;
  refresh: string;
};

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<AuthTokens> | null = null;

// Function to refresh the access token
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorageServices.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post<Partial<AuthTokens>>(
        `${BASE_API_URL}/auth/refresh`,
        { refresh: refreshToken },
      );
      if (!response.data.access) {
        throw new Error(
          "Token refresh response did not include an access token",
        );
      }

      const newTokens: AuthTokens = {
        access: response.data.access,
        refresh: response.data.refresh ?? refreshToken,
      };
      localStorageServices.setAuthTokensToLocalStorage(
        JSON.stringify(newTokens),
      );
      window.dispatchEvent(
        new CustomEvent<AuthTokens>("cms-auth-refreshed", {
          detail: newTokens,
        }),
      );

      return newTokens;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// interceptors
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorageServices.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    const organizationId = localStorage.getItem("cms_organization_id");
    if (organizationId) {
      config.headers["X-Organization-ID"] = organizationId;
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newTokens = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorageServices.removeAuthTokensFromLocalStorage();
        window.dispatchEvent(new Event("cms-auth-expired"));
        throw refreshError;
      }
    }
    return Promise.reject(error);
  },
);
