import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout";
import Dashboard from "../pages/Dashboard";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/Login";
import ForgetPassword from "../pages/ForgetPassword";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <Dashboard />,
			},
		],
	},
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
]);
