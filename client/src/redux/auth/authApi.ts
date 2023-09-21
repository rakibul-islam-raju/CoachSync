import { apiSlice } from "../api/apiSlice";
import { ILoginReqData, ILoginResData } from "./auth.type";
import { userLoggedIn, userLoggedOut } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<ILoginResData, ILoginReqData>({
      query: data => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.access) {
            dispatch(
              userLoggedIn({
                access: data.access,
                refresh: data.refresh,
              }),
            );
          }
        } catch (err) {
          // do nothing
        }
      },
    }),

    logout: builder.mutation<{ detail: string }, { refresh: string }>({
      query: data => ({
        url: "/auth/logout",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.detail) {
            dispatch(userLoggedOut());
          }
        } catch (err) {
          // do nothing
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
