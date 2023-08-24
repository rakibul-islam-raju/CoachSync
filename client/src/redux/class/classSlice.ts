/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IClassParams } from "./class.type";
import { RESULTS_PER_PAGE } from "../../config";

type ClassState = {
  params: IClassParams;
};

const initialState: ClassState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
};

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<IClassParams>>) {
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

export const { setParams, removeParam } = classSlice.actions;
export default classSlice.reducer;
