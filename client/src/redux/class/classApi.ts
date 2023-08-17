/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
	IClass,
	IClassCreateReqData,
	IClassParams,
	IClassUpdateReqData,
} from "./class.type";
import { selectClass } from "./classSlice";

export const classApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getClasses: builder.query<IPaginatedData<IClass[]>, IClassParams>({
			query: (params) => ({
				url: `organizations/classes`,
				params,
			}),
			providesTags: (result) => {
				if (result) {
					return [
						...result.results.map(({ id }) => ({ type: "Class" as const, id })),
						"Class",
					];
				}
				return ["Class"];
			},
		}),

		createClass: builder.mutation<IClass, IClassCreateReqData>({
			query: (data: IClassCreateReqData) => ({
				url: `organizations/classes`,
				method: "POST",
				body: data,
			}),

			// pessimistically update cache
			async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
				const param = getState().class.params;

				try {
					const { data } = await queryFulfilled;
					dispatch(
						classApi.util.updateQueryData(
							"getClasses",
							param,
							(draftClasses: IPaginatedData<IClass[]> | undefined) => {
								if (draftClasses) {
									draftClasses.results.unshift({ ...data });
								}
							}
						)
					);
				} catch {}
			},
		}),

		updateClass: builder.mutation<IClass, IClassUpdateReqData>({
			query: ({ id, data }: IClassUpdateReqData) => ({
				url: `organizations/classes/${id}`,
				method: "PATCH",
				body: data,
			}),

			// pessimistically update cache
			async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
				const param = getState().class.params;

				try {
					const { data } = await queryFulfilled;

					dispatch(
						classApi.util.updateQueryData(
							"getClasses",
							param,
							(draftClasses: IPaginatedData<IClass[]> | undefined) => {
								if (draftClasses) {
									const updatedClassIndex = draftClasses.results.findIndex(
										(item) => item.id === id
									);
									draftClasses.results[updatedClassIndex] = { ...data };
								}
							}
						)
					);
				} catch {}

				// clear seletecd item from state
				dispatch(selectClass({ data: null, action: null }));
			},
		}),

		deleteClass: builder.mutation<void, number>({
			query: (id: number) => ({
				url: `organizations/classes/${id}`,
				method: "DELETE",
			}),

			// pessimistically update cache
			async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
				const param = getState().class.params;

				try {
					await queryFulfilled;
					dispatch(
						classApi.util.updateQueryData(
							"getClasses",
							param,
							(draftClasses: IPaginatedData<IClass[]> | undefined) => {
								if (draftClasses) {
									draftClasses.results = draftClasses.results.filter(
										(item) => Number(item.id) !== id
									);
								}
							}
						)
					);
				} catch {}

				// clear seletecd item from state
				dispatch(selectClass({ data: null, action: null }));
			},
		}),

		searchClass: builder.query<IPaginatedData<IClass[]>, undefined>({
			query: (params) => ({
				url: `organizations/classes`,
				params,
			}),
			providesTags: ["ClassSearch"],
		}),
	}),
});

export const {
	useGetClassesQuery,
	useCreateClassMutation,
	useUpdateClassMutation,
	useDeleteClassMutation,
} = classApi;
