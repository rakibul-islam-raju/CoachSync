import { useEffect, useState } from "react";
import { setUserInfo, userLoggedIn } from "../redux/auth/authSlice";
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
			console.log("use auth check");

			if (auth?.access && auth?.refresh && data) {
				dispatch(
					userLoggedIn({
						access: auth.access,
						refresh: auth.refresh,
					})
				);

				dispatch(setUserInfo(data));
			}
		}

		setAuthChecked(true);
	}, [isSuccess]);

	return authChecked;
}
