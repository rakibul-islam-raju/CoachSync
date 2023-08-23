import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout/RootLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/Login/Login";
import ForgetPassword from "../pages/ForgetPassword/ForgetPassword";
import ProtectedLayout from "../components/layouts/ProtectedLayout/ProtectedLayout";
import PublicLayout from "../components/layouts/PublicLayout/PublicLayout";
import Class from "../pages/Class/Class";
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
