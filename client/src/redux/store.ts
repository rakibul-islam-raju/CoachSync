import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./auth/authSlice";
import batchReducer from "./batch/batchSlice";
import classReducer from "./class/classSlice";
import subjectReducer from "./subject/subjectSlice";
import teacherReducer from "./teacher/teacherSlice";
import userReducer from "./user/userSlice";

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  user: userReducer,
  class: classReducer,
  subject: subjectReducer,
  teacher: teacherReducer,
  batch: batchReducer,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
