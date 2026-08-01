import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role, isRole } from "../../../constants/roles.constants";
import { useAppSelector } from "../../../redux/hook";

type RoleProtectedLayoutProps = {
  allowedRoles: Role[];
};

export default function RoleProtectedLayout({
  allowedRoles,
}: RoleProtectedLayoutProps) {
  const location = useLocation();
  const role = useAppSelector(state => state.auth.user?.role);
  const allowed = isRole(role) && allowedRoles.includes(role);

  return allowed ? (
    <Outlet />
  ) : (
    <Navigate
      to="/unauthorized"
      replace
      state={{ deniedUrl: location.pathname }}
    />
  );
}
