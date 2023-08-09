import { apiSlice } from "../api/apiSlice";
import { setUserInfo } from "../auth/authSlice";

export const userApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
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
	}),
});

export const { useGetMeQuery } = userApi;
