/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  IBatch,
  IBatchCreateReqData,
  IBatchParams,
  IBatchUpdateReqData,
} from "./batch.type";

export const batchApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getBatches: builder.query<IPaginatedData<IBatch[]>, IBatchParams>({
      query: params => ({
        url: `organizations/batches`,
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Batches" as const,
              id,
            })),
            "Batches",
          ];
        }
        return ["Batches"];
      },
    }),

    getBatch: builder.query<IBatch, number>({
      query: batchId => ({
        url: `organizations/batches/${batchId}`,
      }),
      providesTags: result => {
        if (result) {
          return [
            {
              type: "Batch" as const,
              id: result.id,
            },
          ];
        }
        return ["Batch"];
      },
    }),

    createBatch: builder.mutation<IBatch, IBatchCreateReqData>({
      query: (data: IBatchCreateReqData) => ({
        url: `organizations/batches`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["OrgStats"],

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().batch.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            batchApi.util.updateQueryData(
              "getBatches",
              param,
              (draft: IPaginatedData<IBatch[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateBatch: builder.mutation<IBatch, IBatchUpdateReqData>({
      query: ({ id, data }: IBatchUpdateReqData) => ({
        url: `organizations/batches/${id}`,
        method: "PATCH",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted(
        { id, data: postData },
        { dispatch, queryFulfilled, getState },
      ) {
        const param = getState().batch.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            batchApi.util.updateQueryData(
              "getBatches",
              param,
              (draft: IPaginatedData<IBatch[]> | undefined) => {
                if (draft) {
                  const updatedBatchIndex = draft.results.findIndex(
                    item => item.id === id,
                  );
                  draft.results[updatedBatchIndex] = { ...data };
                }
              },
            ),
          );

          if (postData.is_active) {
            dispatch(batchApi.util.invalidateTags(["OrgStats"]));
          }
        } catch {}
      },
    }),

    deleteBatch: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `organizations/batches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrgStats"],

      // pessimistically update cache
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const param = getState().batch.params;

        try {
          await queryFulfilled;
          dispatch(
            batchApi.util.updateQueryData(
              "getBatches",
              param,
              (draft: IPaginatedData<IBatch[]> | undefined) => {
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

    searchBatch: builder.query<IPaginatedData<IBatch[]>, undefined>({
      query: params => ({
        url: `organizations/Batches`,
        params,
      }),
      providesTags: ["BatchSearch"],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useSearchBatchQuery,
} = batchApi;
