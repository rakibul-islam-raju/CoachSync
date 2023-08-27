/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESULTS_PER_PAGE } from "../../config";
import { IBatchParams } from "./batch.type";

type BatchState = {
  params: IBatchParams;
};

const initialState: BatchState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
};

const batchSlice = createSlice({
  name: "batch",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<IBatchParams>>) {
      state.params = {
        ...state.params,
        ...action.payload,
      };
    },

    removeParam(state, action: PayloadAction<string>) {
      const paramKey = action.payload;
      if (state.params.hasOwnProperty(paramKey)) {
        delete state.params[paramKey];
      }
    },
  },
});

export const { setParams, removeParam } = batchSlice.actions;
export default batchSlice.reducer;
