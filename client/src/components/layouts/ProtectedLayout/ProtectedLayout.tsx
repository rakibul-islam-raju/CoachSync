import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function ProtectedLayout() {
	const location = useLocation();
	const authenticated = useAuth();

	return authenticated ? (
		<Outlet />
	) : (
		<Navigate
			to={"/login"}
			replace
			state={{ redirectUrl: location.pathname }}
		/>
	);
}
