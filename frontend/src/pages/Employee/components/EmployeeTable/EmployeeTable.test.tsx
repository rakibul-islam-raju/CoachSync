import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { setUserInfo, userLoggedOut } from "../../../../redux/auth/authSlice";
import store from "../../../../redux/store";
import EmployeeTable from "./EmployeeTable";

const orgAdmin: IUser = {
  id: 1,
  first_name: "Organization",
  last_name: "Admin",
  full_name: "Organization Admin",
  phone: "01700000001",
  email: "org-admin@example.com",
  is_active: true,
  is_staff: false,
  is_superuser: false,
  role: "org_admin",
  created_at: new Date(),
  updated_at: new Date(),
};

const orgStaff: IUser = {
  ...orgAdmin,
  id: 2,
  first_name: "Organization",
  last_name: "Staff",
  full_name: "Organization Staff",
  email: "org-staff@example.com",
  phone: "01700000002",
  role: "org_staff",
};

vi.mock("../../../../redux/user/userApi", () => ({
  useGetUsersQuery: () => ({
    data: {
      count: 2,
      next: null,
      previous: null,
      results: [orgAdmin, orgStaff],
    },
    isLoading: false,
    isError: false,
    error: undefined,
  }),
  useDeleteUserMutation: () => [
    vi.fn(),
    {
      isLoading: false,
      isError: false,
      error: undefined,
      isSuccess: false,
    },
  ],
}));

const renderTable = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <EmployeeTable />
      </MemoryRouter>
    </Provider>,
  );

describe("EmployeeTable authorization", () => {
  afterEach(() => {
    cleanup();
    store.dispatch(userLoggedOut());
  });

  it("only shows actions for employees below the current role", () => {
    store.dispatch(setUserInfo(orgAdmin));

    renderTable();

    expect(
      screen.queryByLabelText("edit org-admin@example.com"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("edit org-staff@example.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("delete org-staff@example.com"),
    ).toBeInTheDocument();
  });

  it("shows no action column to organization staff", () => {
    store.dispatch(setUserInfo(orgStaff));

    renderTable();

    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/edit /)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/delete /)).not.toBeInTheDocument();
  });
});
