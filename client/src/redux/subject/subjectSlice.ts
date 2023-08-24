/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISubjectParams } from "./subject.type";
import { RESULTS_PER_PAGE } from "../../config";

type SubjectState = {
  params: ISubjectParams;
};

const initialState: SubjectState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
};

const subjectSlice = createSlice({
  name: "subject",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<ISubjectParams>>) {
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

export const { setParams, removeParam } = subjectSlice.actions;
export default subjectSlice.reducer;
