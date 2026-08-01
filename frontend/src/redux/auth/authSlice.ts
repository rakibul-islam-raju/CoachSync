import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface IAuthState {
  access: string | null;
  refresh: string | null;
  user?: IUser | null;
}

interface ITokens {
  access: string;
  refresh: string;
}

const authDataString = localStorage.getItem("cms_auth");

let access: string | null = null;
let refresh: string | null = null;
let user: IUser | null = null;

if (authDataString) {
  try {
    const authData: ITokens = JSON.parse(authDataString);
    access = authData.access;
    refresh = authData.refresh;
    user = jwtDecode<IDecodedType>(authData.access).user;
  } catch {
    localStorage.removeItem("cms_auth");
  }
}

const initialState: IAuthState = {
  access: access ?? null,
  refresh: refresh ?? null,
  user,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn(
      state,
      action: PayloadAction<{ access: string; refresh: string }>,
    ) {
      const decodedtoken: IDecodedType = jwtDecode(action.payload.access);

      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.user = decodedtoken.user;

      if (decodedtoken.user.organizations?.length) {
        const selected = localStorage.getItem("cms_organization_id");
        if (!selected) {
          localStorage.setItem(
            "cms_organization_id",
            String(decodedtoken.user.organizations[0]),
          );
        }
      }

      if (state.access && state.refresh) {
        const auth = {
          access: state.access,
          refresh: state.refresh,
        };

        localStorage.setItem("cms_auth", JSON.stringify(auth));
      }
    },
    userLoggedOut(state) {
      state.access = null;
      state.refresh = null;
      state.user = null;

      localStorage.removeItem("cms_auth");
      localStorage.removeItem("cms_organization_id");
    },
    setUserInfo(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
  },
});

export const { userLoggedIn, userLoggedOut, setUserInfo } = authSlice.actions;
export default authSlice.reducer;
