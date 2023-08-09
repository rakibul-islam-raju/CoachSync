import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function PublicLayout() {
	const authenticated = useAuth();

	return !authenticated ? <Outlet /> : <Navigate to={"/"} replace />;
}
