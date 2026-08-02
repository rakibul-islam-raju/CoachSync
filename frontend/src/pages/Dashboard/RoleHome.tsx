import { Navigate } from "react-router-dom";
import { hasOperationalAccess } from "../../constants/roles.constants";
import { useAppSelector } from "../../redux/hook";

export default function RoleHome() {
  const role = useAppSelector(state => state.auth.user?.role);
  return (
    <Navigate
      to={hasOperationalAccess(role) ? "/dashboard" : "/results"}
      replace
    />
  );
}
