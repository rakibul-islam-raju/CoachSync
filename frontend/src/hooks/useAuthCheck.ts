import { useEffect, useState } from "react";
import {
  setUserInfo,
  userLoggedIn,
  userLoggedOut,
} from "../redux/auth/authSlice";
import { useAppDispatch } from "../redux/hook";
import { useGetMeQuery } from "../redux/user/userApi";

export default function useAuthCheck() {
  const dispatch = useAppDispatch();

  const { data, isSuccess } = useGetMeQuery(undefined);

  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    const localAuth = localStorage?.getItem("cms_auth");

    if (localAuth && isSuccess) {
      const auth = JSON.parse(localAuth);

      if (auth?.access && auth?.refresh && data) {
        dispatch(
          userLoggedIn({
            access: auth.access,
            refresh: auth.refresh,
          }),
        );

        dispatch(setUserInfo(data));
      }
    }

    setAuthChecked(true);
  }, [data, dispatch, isSuccess]);

  useEffect(() => {
    const handleAuthRefreshed = (event: Event) => {
      const { access, refresh } = (event as CustomEvent).detail;
      dispatch(userLoggedIn({ access, refresh }));
    };
    const handleAuthExpired = () => dispatch(userLoggedOut());

    window.addEventListener("cms-auth-refreshed", handleAuthRefreshed);
    window.addEventListener("cms-auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("cms-auth-refreshed", handleAuthRefreshed);
      window.removeEventListener("cms-auth-expired", handleAuthExpired);
    };
  }, [dispatch]);

  return authChecked;
}
