/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import jwt_decode from "jwt-decode";
import { setUserInfo, userLoggedIn, userLoggedOut } from "../auth/authSlice";
import { RootState } from "../store";
import { BASE_API_URL } from "../../config";

// Create a new mutex
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders: async (headers, { getState }) => {
    const token = (getState() as RootState).auth.access;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions = {}) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        // send the refresh token to get new access token
        const refresh = (api.getState() as RootState).auth.refresh;

        // TODO: remove any type
        const refreshResult: any = await baseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refresh },
          },
          api,
          extraOptions,
        );
        if (refreshResult && refreshResult?.data?.access) {
          const decodedData: IDecodedType = jwt_decode(
            refreshResult.data.access,
          );
          const decodedUserData: IUser = decodedData.user;

          api.dispatch(
            userLoggedIn({
              access: refreshResult.data.access,
              refresh: refreshResult.data.refresh,
            }),
          );

          api.dispatch(setUserInfo(decodedUserData));

          // retry with new access token
          result = await baseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem("cms_auth");
          api.dispatch(userLoggedOut());
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Users",
    "Me",
    "Class",
    "ClassSearch",
    "Batch",
    "Schedule",
    "Teacher",
    "Student",
    "Subject",
    "SubjectSearch",
  ],
  endpoints: () => ({}),
});
