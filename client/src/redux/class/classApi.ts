/* eslint-disable no-mixed-spaces-and-tabs */
import { apiSlice } from "../api/apiSlice";
import { IClass, IClassCreateReqData, IClassUpdateReqData } from "./class.type";

export const classApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getClasses: builder.query<IPaginatedData<IClass[]>, undefined>({
			query: () => ({
				url: `organizations/classes`,
			}),
			// providesTags: ["Class"],
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
			async onQueryStarted(_data, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(
						classApi.util.updateQueryData(
							"getClasses",
							undefined,
							(draftClasses: IPaginatedData<IClass[]> | undefined) => {
								if (draftClasses) {
									draftClasses.results.unshift({ ...data });
								}
							}
						)
					);
				} catch {
					// dispatch(classApi.util.invalidateTags(["Class"]));
				}
			},
		}),

		updateClass: builder.mutation<IClass, IClassUpdateReqData>({
			query: ({ id, data }: IClassUpdateReqData) => ({
				url: `organizations/classes/${id}`,
				method: "POST",
				body: data,
			}),
			async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(
						classApi.util.updateQueryData(
							"getClasses",
							undefined,
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
				} catch {
					// dispatch(classApi.util.invalidateTags(["Class"]));
				}
			},
		}),

		deleteClass: builder.mutation<void, number>({
			query: (id: number) => ({
				url: `organizations/classes/${id}`,
				method: "DELETE",
			}),
			async onQueryStarted(id, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					dispatch(
						classApi.util.updateQueryData(
							"getClasses",
							undefined,
							(draftClasses: IPaginatedData<IClass[]> | undefined) => {
								if (draftClasses) {
									draftClasses.results.filter((item) => item.id !== id);
								}
							}
						)
					);
				} catch {
					// dispatch(classApi.util.invalidateTags(["Class"]));
				}
			},
		}),
	}),
});

export const {
	useGetClassesQuery,
	useCreateClassMutation,
	useUpdateClassMutation,
	useDeleteClassMutation,
} = classApi;
