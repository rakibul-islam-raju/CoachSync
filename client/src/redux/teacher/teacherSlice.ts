/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { ITeacherParams } from "./teacher.type";
import { RESULTS_PER_PAGE } from "../../config";

export interface ITeacherParams {
  limit?: number;
  offset?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}

type TeacherState = {
  search?: string;
  params: ITeacherParams;
};

const initialState: TeacherState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    removeSearchTerm(state) {
      delete state.search;
    },

    setParams(state, action: PayloadAction<Partial<ITeacherParams>>) {
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

export const { setSearchTerm, removeSearchTerm, setParams, removeParam } =
  teacherSlice.actions;
export default teacherSlice.reducer;
