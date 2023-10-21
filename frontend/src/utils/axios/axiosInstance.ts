import axios from "axios";
import { BASE_API_URL } from "../../config";
import { localStorageServices } from "../../services/localStorageService";

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to refresh the access token
async function refreshAccessToken() {
  try {
    const refreshToken = localStorageServices.getRefreshToken();
    if (!refreshToken) {
      localStorageServices.removeAuthTokensFromLocalStorage();
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${BASE_API_URL}/auth/refresh`, {
      refreshToken: refreshToken,
    });

    const newTokens = response.data;
    localStorageServices.setAuthTokensToLocalStorage(JSON.stringify(newTokens));

    return newTokens;
  } catch (error) {
    localStorageServices.removeAuthTokensFromLocalStorage();
    console.error("Token refresh error:", error);
    throw error;
  }
}

// interceptors
axiosInstance.interceptors.request.use(
  config => {
    // Get the access token from your storage (e.g., localStorage)
    const accessToken = localStorageServices.getAccessToken();
    console.log("accessToken =>", accessToken);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      try {
        // Attempt to refresh the access token
        const newTokens = await refreshAccessToken();

        // Retry the original request with the new access token
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorageServices.removeAuthTokensFromLocalStorage();
        console.error("Token refresh failed:", refreshError);
        throw refreshError;
      }
    }
    return Promise.reject(error);
  },
);
