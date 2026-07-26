import { apiSlice } from "../api/apiSlice";
import {
  IChangePasswordReqData,
  IForgetPasswordReqData,
  ILoginReqData,
  ILoginResData,
  IMessageResponse,
  ISetPasswordReqData,
} from "./auth.type";
import { userLoggedIn, userLoggedOut } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<ILoginResData, ILoginReqData>({
      query: data => ({
        url: "/auth/login",
        method: "POST",
        data,
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
        } catch {
          // do nothing
        }
      },
    }),

    logout: builder.mutation<{ detail: string }, { refresh: string }>({
      query: data => ({
        url: "/auth/logout",
        method: "POST",
        data,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.detail) {
            dispatch(userLoggedOut());
          }
        } catch {
          // do nothing
        }
      },
    }),

    forgetPassword: builder.mutation<
      IForgetPasswordReqData,
      IForgetPasswordReqData
    >({
      query: data => ({
        url: "/auth/forget-password",
        method: "POST",
        data,
      }),
    }),

    setPassword: builder.mutation<IMessageResponse, ISetPasswordReqData>({
      query: data => ({
        url: "/auth/set-password",
        method: "POST",
        data,
      }),
    }),

    changePassword: builder.mutation<IMessageResponse, IChangePasswordReqData>({
      query: data => ({
        url: "/auth/change-password",
        method: "POST",
        data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgetPasswordMutation,
  useSetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
