/* eslint-disable no-empty */
import { apiSlice } from "../api/apiSlice";
import { setUserInfo } from "../auth/authSlice";
import { IUserCreateData, IUserParams, IUserUpdateData } from "./user.type";

export const userApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMe: builder.query<IUser, undefined>({
      query: () => ({
        url: `/users/me`,
        method: "GET",
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
        url: `/users`,
        method: "GET",
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

    createUser: builder.mutation<IUser, IUserCreateData>({
      query: (data: IUserCreateData) => ({
        url: `/users/`,
        method: "POST",
        data,
      }),

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().user.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData(
              "getUsers",
              param,
              (draft: IPaginatedData<IUser[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateUser: builder.mutation<IUser, IUserUpdateData>({
      query: ({ id, user }: IUserUpdateData) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data: user,
      }),

      // pessimistically update cache
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        const param = getState().user.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            userApi.util.updateQueryData(
              "getUsers",
              param,
              (draft: IPaginatedData<IUser[]> | undefined) => {
                if (draft) {
                  const updatedUserIndex = draft.results.findIndex(
                    item => item.id === id,
                  );
                  draft.results[updatedUserIndex] = { ...data };
                }
              },
            ),
          );
        } catch {}
      },
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),

      // pessimistically update cache
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const param = getState().user.params;

        try {
          await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData(
              "getUsers",
              param,
              (draft: IPaginatedData<IUser[]> | undefined) => {
                if (draft) {
                  draft.results = draft.results.filter(
                    item => Number(item.id) !== id,
                  );
                }
              },
            ),
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
