import { apiSlice } from "../api/apiSlice";
import { setUserInfo } from "../auth/authSlice";
import { IUserParams } from "./user.type";

export const userApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMe: builder.query<IUser, undefined>({
      query: () => ({
        url: `users/me`,
      }),
      providesTags: ["Me"],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserInfo(data));
        } catch (err) {
          // do nothing
        }
      },
    }),

    getUsers: builder.query<IPaginatedData<IUser[]>, IUserParams>({
      query: params => ({
        url: `users`,
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "User" as const,
              id,
            })),
            "User",
          ];
        }
        return ["User"];
      },
    }),
  }),
});

export const { useGetMeQuery, useGetUsersQuery } = userApi;
