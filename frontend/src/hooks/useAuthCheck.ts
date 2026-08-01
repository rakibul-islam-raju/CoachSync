import { useEffect, useState } from "react";
import {
  setUserInfo,
  userLoggedIn,
  userLoggedOut,
} from "../redux/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { useGetMeQuery } from "../redux/user/userApi";

export default function useAuthCheck() {
  const dispatch = useAppDispatch();
  const { access } = useAppSelector(state => state.auth);

  const { data, isSuccess, isError } = useGetMeQuery(undefined, {
    skip: !access,
  });

  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    if (!access) {
      setAuthChecked(true);
      return;
    }

    if (isSuccess && data) {
      dispatch(setUserInfo(data));
      setAuthChecked(true);
    } else if (isError) {
      dispatch(userLoggedOut());
      setAuthChecked(true);
    }
  }, [access, data, dispatch, isError, isSuccess]);

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
