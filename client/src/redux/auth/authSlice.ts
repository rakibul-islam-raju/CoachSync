import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwt_decode from "jwt-decode";

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

if (authDataString) {
  const authData: ITokens = JSON.parse(authDataString);
  access = authData.access;
  refresh = authData.refresh;
}

const initialState: IAuthState = {
  access: access ?? null,
  refresh: refresh ?? null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn(
      state,
      action: PayloadAction<{ access: string; refresh: string }>,
    ) {
      const decodedtoken: IDecodedType = jwt_decode(action.payload.access);

      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.user = decodedtoken.user;

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
    },
    setUserInfo(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
  },
});

export const { userLoggedIn, userLoggedOut, setUserInfo } = authSlice.actions;
export default authSlice.reducer;
