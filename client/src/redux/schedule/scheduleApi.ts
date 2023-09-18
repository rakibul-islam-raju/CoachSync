/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  ISchedule,
  IScheduleCreateReqData,
  IScheduleParams,
  IScheduleUpdateReqData,
} from "./schedule.type";

export const scheduleApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getSchedules: builder.query<IPaginatedData<ISchedule[]>, IScheduleParams>({
      query: params => ({
        url: `organizations/schedules`,
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Schedule" as const,
              id,
            })),
            "Schedule",
          ];
        }
        return ["Schedule"];
      },
    }),

    createSchedule: builder.mutation<ISchedule[], IScheduleCreateReqData[]>({
      query: (data: IScheduleCreateReqData[]) => ({
        url: `organizations/schedules`,
        method: "POST",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().schedule.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            scheduleApi.util.updateQueryData(
              "getSchedules",
              param,
              (draft: IPaginatedData<ISchedule[]> | undefined) => {
                if (draft) {
                  draft.results = [...data, ...draft.results];
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateSchedule: builder.mutation<ISchedule, IScheduleUpdateReqData>({
      query: ({ id, data }: IScheduleUpdateReqData) => ({
        url: `organizations/schedules/${id}`,
        method: "PATCH",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            scheduleApi.util.invalidateTags([
              { type: "Schedule", id: data.id },
            ]),
          );
        } catch {}
      },
    }),

    deleteSchedule: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `organizations/schedules/${id}`,
        method: "DELETE",
      }),

      // pessimistically update cache
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const param = getState().schedule.params;

        try {
          await queryFulfilled;
          dispatch(
            scheduleApi.util.updateQueryData(
              "getSchedules",
              param,
              (draft: IPaginatedData<ISchedule[]> | undefined) => {
                if (draft) {
                  draft.results = draft.results.filter(
                    item => Number(item.id) !== id,
                  );
                }
              },
            ),
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi;
