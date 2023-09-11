/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESULTS_PER_PAGE } from "../../config";
import { ITeacherParams } from "./teacher.type";

type TeacherState = {
  params: ITeacherParams;
  page: number;
};

const initialState: TeacherState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
  page: 1,
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<ITeacherParams>>) {
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
  teacherSlice.actions;
export default teacherSlice.reducer;
