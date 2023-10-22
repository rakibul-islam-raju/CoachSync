/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  ITransaction,
  ITransactionCreateReqData,
  ITransactionParams,
  ITransactionStats,
} from "./transaction.type";

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getTransactions: builder.query<
      IPaginatedData<ITransaction[]>,
      ITransactionParams
    >({
      query: params => ({
        url: `/students/enrolls/${params.enroll}/transactions`,
        method: "GET",
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Transaction" as const,
              id,
            })),
            "Transaction",
          ];
        }
        return ["Transaction"];
      },
    }),

    creategetTransaction: builder.mutation<
      ITransaction,
      ITransactionCreateReqData
    >({
      query: (data: ITransactionCreateReqData) => ({
        url: `/students/enrolls/${data.enroll}/transactions`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["TransactionStats", "Student"],

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().transaction.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            transactionApi.util.updateQueryData(
              "getTransactions",
              { ...param, enroll: _data.enroll },
              (draft: IPaginatedData<ITransaction[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    getTransactionStats: builder.query<ITransactionStats[], number>({
      query: year => ({
        url: `/students/statistics/transactions`,
        method: "GET",
        params: {
          year,
        },
      }),
      providesTags: ["TransactionStats"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreategetTransactionMutation,
  useGetTransactionStatsQuery,
} = transactionApi;
