import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { OPERATIONAL_ROLES } from "../../../constants/roles.constants";
import { setUserInfo, userLoggedOut } from "../../../redux/auth/authSlice";
import store from "../../../redux/store";
import RoleProtectedLayout from "./RoleProtectedLayout";

const user: IUser = {
  id: 1,
  first_name: "Test",
  last_name: "User",
  full_name: "Test User",
  phone: "01700000001",
  email: "user@example.com",
  is_active: true,
  is_staff: false,
  is_superuser: false,
  role: "org_staff",
  created_at: new Date(),
  updated_at: new Date(),
};

const renderRoute = () =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/employees"]}>
        <Routes>
          <Route
            element={<RoleProtectedLayout allowedRoles={OPERATIONAL_ROLES} />}
          >
            <Route path="/employees" element={<div>Employee workspace</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Access denied</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe("RoleProtectedLayout", () => {
  afterEach(() => {
    cleanup();
    store.dispatch(userLoggedOut());
  });

  it("renders an operational route for organization staff", () => {
    store.dispatch(setUserInfo(user));

    renderRoute();

    expect(screen.getByText("Employee workspace")).toBeInTheDocument();
  });

  it("redirects students away from the administration workspace", () => {
    store.dispatch(setUserInfo({ ...user, role: "student" }));

    renderRoute();

    expect(screen.getByText("Access denied")).toBeInTheDocument();
  });
});
