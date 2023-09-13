/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  ITransaction,
  ITransactionCreateReqData,
  ITransactionParams,
} from "./transaction.type";

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getTransactions: builder.query<
      IPaginatedData<ITransaction[]>,
      ITransactionParams
    >({
      query: params => ({
        url: `students/enrolls/${params.enroll}/transactions`,
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
        url: `students/enrolls/${data.enroll}/transactions`,
        method: "POST",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().transaction.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            transactionApi.util.updateQueryData(
              "getTransactions",
              param,
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
  }),
});

export const { useGetTransactionsQuery, useCreategetTransactionMutation } =
  transactionApi;
