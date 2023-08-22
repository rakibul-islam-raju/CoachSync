import { apiSlice } from "../api/apiSlice";
import { ILoginReqData, ILoginResData } from "./auth.type";
import { userLoggedIn } from "./authSlice";

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
  }),
});

export const { useLoginMutation } = authApi;
