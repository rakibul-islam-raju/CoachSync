/* eslint-disable no-prototype-builtins */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESULTS_PER_PAGE } from "../../config";
import { IScheduleDemoData, IScheduleParams } from "./schedule.type";

type ScheduleState = {
  params: IScheduleParams;
  page: number;
  newSchedules: IScheduleDemoData[];
};

const initialState: ScheduleState = {
  params: {
    limit: RESULTS_PER_PAGE,
    offset: 0,
  },
  page: 1,
  newSchedules: [],
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<IScheduleParams>>) {
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

    addNewSchedule(state, action: PayloadAction<IScheduleDemoData>) {
      state.newSchedules.push(action.payload);
    },

    removeNewSchedule(state, action: PayloadAction<string>) {
      state.newSchedules = state.newSchedules.filter(
        i => i.uuid !== action.payload,
      );
    },
  },
});

export const {
  setParams,
  removeParam,
  setPage,
  resetParams,
  addNewSchedule,
  removeNewSchedule,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
