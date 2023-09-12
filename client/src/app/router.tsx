import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import ProtectedLayout from "../components/layouts/ProtectedLayout/ProtectedLayout";
import PublicLayout from "../components/layouts/PublicLayout/PublicLayout";
import RootLayout from "../components/layouts/RootLayout/RootLayout";
import Batch from "../pages/Batch/Batch";
import BatchDetails from "../pages/Batch/BatchDetails/BatchDetails";
import Class from "../pages/Class/Class";
import Dashboard from "../pages/Dashboard/Dashboard";
import Employee from "../pages/Employee/Employee";
import ForgetPassword from "../pages/ForgetPassword/ForgetPassword";
import Login from "../pages/Login/Login";
import Student from "../pages/Student/Student";
import StudentDetails from "../pages/Student/StudentDetails";
import Subject from "../pages/Subject/Subject";
import Teacher from "../pages/Teacher/Teacher";

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
            element: <Dashboard />,
          },
          {
            path: "batches",
            element: <Batch />,
          },
          {
            path: "batches/:batchId/:batchName",
            element: <BatchDetails />,
          },
          {
            path: "students",
            element: <Student />,
          },
          {
            path: "students/:studentId",
            element: <StudentDetails />,
          },
          {
            path: "teachers",
            element: <Teacher />,
          },
          {
            path: "classes",
            element: <Class />,
          },
          {
            path: "subjects",
            element: <Subject />,
          },
          {
            path: "employees",
            element: <Employee />,
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
            element: <Login />,
          },
          {
            path: "/reset-password",
            element: <ForgetPassword />,
          },
        ],
      },
    ],
  },
]);
