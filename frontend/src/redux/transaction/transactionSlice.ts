/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RESULTS_PER_PAGE } from "../../config";
import { ITransactionParams } from "./transaction.type";

type TransactionState = {
  params: ITransactionParams;
  page: number;
};

const initialState: TransactionState = {
  params: {
    limit: 10,
    offset: 0,
  },
  page: 1,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<ITransactionParams>>) {
      if ("search" in action.payload && action.payload.search !== undefined) {
        state.params = {
          ...state.params,
          ...action.payload,
          offset: 0,
        };
        state.page = 1;
      } else {
        state.params = {
          ...state.params,
          ...action.payload,
        };
      }
    },

    removeParam(state, action: PayloadAction<string>) {
      const paramKey = action.payload;
      if (state.params.hasOwnProperty(paramKey)) {
        delete state.params[paramKey];
      }
    },

    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
      const offset: number =
        (Number(state.page) - 1) * Number(state.params.limit);
      state.params.offset = offset;
    },

    resetParams(state) {
      state.params = { ...initialState.params };
      state.page = initialState.page;
    },
  },
});

export const { setParams, removeParam, setPage, resetParams } =
  transactionSlice.actions;
export default transactionSlice.reducer;
