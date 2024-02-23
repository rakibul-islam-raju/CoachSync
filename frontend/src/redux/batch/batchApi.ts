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
        url: `/organizations/batches`,
        method: "GET",
        params,
      }),
      providesTags: ["Batches"],
    }),

    getBatch: builder.query<IBatch, number>({
      query: batchId => ({
        url: `/organizations/batches/${batchId}`,
        method: "GET",
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
        url: `/organizations/batches`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["OrgStats", "Batches"],
    }),

    updateBatch: builder.mutation<IBatch, IBatchUpdateReqData>({
      query: ({ id, data }: IBatchUpdateReqData) => ({
        url: `/organizations/batches/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Batches"],
    }),

    deleteBatch: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/organizations/batches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrgStats", "Batches"],
    }),

    searchBatch: builder.query<IPaginatedData<IBatch[]>, undefined>({
      query: params => ({
        url: `/organizations/Batches`,
        method: "GET",
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
