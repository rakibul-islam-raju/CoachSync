import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layouts/RootLayout/RootLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/Login/Login";
import ForgetPassword from "../pages/ForgetPassword/ForgetPassword";

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
