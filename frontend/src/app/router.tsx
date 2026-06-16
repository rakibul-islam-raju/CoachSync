import { ComponentType, LazyExoticComponent, lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import Loader from "../components/Loader";
import ProtectedLayout from "../components/layouts/ProtectedLayout/ProtectedLayout";
import PublicLayout from "../components/layouts/PublicLayout/PublicLayout";
import RootLayout from "../components/layouts/RootLayout/RootLayout";

const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Schedule = lazy(() => import("../pages/schedule/schedule"));
const AddSchedule = lazy(
  () => import("../pages/schedule/AddSchedule/AddSchedule"),
);
const Batch = lazy(() => import("../pages/Batch/Batch"));
const BatchDetails = lazy(
  () => import("../pages/Batch/BatchDetails/BatchDetails"),
);
const Student = lazy(() => import("../pages/Student/Student"));
const StudentDetails = lazy(
  () => import("../pages/Student/StudentDetails/StudentDetails"),
);
const Teacher = lazy(() => import("../pages/Teacher/Teacher"));
const Class = lazy(() => import("../pages/Class/Class"));
const Subject = lazy(() => import("../pages/Subject/Subject"));
const Employee = lazy(() => import("../pages/Employee/Employee"));
const Login = lazy(() => import("../pages/Login/Login"));
const ForgetPassword = lazy(() => import("../pages/ForgetPassword/ForgetPassword"));

const lazyElement = (
  Component: LazyExoticComponent<ComponentType<object>>,
) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // protected routes
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: lazyElement(Dashboard),
          },
          {
            path: "schedules",
            element: lazyElement(Schedule),
          },
          {
            path: "add-schedules",
            element: lazyElement(AddSchedule),
          },
          {
            path: "batches",
            element: lazyElement(Batch),
          },
          {
            path: "batches/:batchId/:batchName",
            element: lazyElement(BatchDetails),
          },
          {
            path: "students",
            element: lazyElement(Student),
          },
          {
            path: "students/:studentId",
            element: lazyElement(StudentDetails),
          },
          {
            path: "teachers",
            element: lazyElement(Teacher),
          },
          {
            path: "classes",
            element: lazyElement(Class),
          },
          {
            path: "subjects",
            element: lazyElement(Subject),
          },
          {
            path: "employees",
            element: lazyElement(Employee),
          },
        ],
      },
    ],
  },

  // public routes
  {
    element: <PublicLayout />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: lazyElement(Login),
          },
          {
            path: "/reset-password",
            element: lazyElement(ForgetPassword),
          },
        ],
      },
    ],
  },
]);
