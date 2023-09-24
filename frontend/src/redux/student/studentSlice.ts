/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESULTS_PER_PAGE } from "../../config";
import { IStudentParams } from "./student.type";

type StudentState = {
  params: IStudentParams;
  page: number;
};

const initialState: StudentState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
  page: 1,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<IStudentParams>>) {
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
  studentSlice.actions;
export default studentSlice.reducer;
