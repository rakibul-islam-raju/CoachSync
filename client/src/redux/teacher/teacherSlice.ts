/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESULTS_PER_PAGE } from "../../config";
import { ITeacherParams } from "./teacher.type";

type TeacherState = {
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

export const { setParams, removeParam } = teacherSlice.actions;
export default teacherSlice.reducer;
