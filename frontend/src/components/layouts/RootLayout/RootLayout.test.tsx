import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import RootLayout from "./RootLayout";
import { MAIN_MENUS } from "./constants";
import store from "../../../redux/store";
import { setUserInfo, userLoggedOut } from "../../../redux/auth/authSlice";

const operationalUser: IUser = {
  id: 1,
  first_name: "Operations",
  last_name: "User",
  full_name: "Operations User",
  phone: "01700000001",
  email: "operations@example.com",
  is_active: true,
  is_staff: false,
  is_superuser: false,
  role: "org_staff",
  created_at: new Date(),
  updated_at: new Date(),
};

const renderRootLayout = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    </Provider>,
  );

describe("Login Page", () => {
  beforeEach(() => {
    store.dispatch(setUserInfo(operationalUser));
  });

  afterEach(() => {
    cleanup();
    store.dispatch(userLoggedOut());
  });
  // const user = userEvent.setup();

  it("should render correctly", () => {
    renderRootLayout();

    // Check if Login header is rendered
    expect(screen.getByText("CoachSync")).toBeInTheDocument();

    // Check if main menus are rendered
    MAIN_MENUS.forEach(item => {
      const menuItem = screen.getByText(item.label);
      expect(menuItem).toBeInTheDocument();
    });
  });

  it("should toggle the drawer", () => {
    renderRootLayout();
    const menuOpenButton = screen.getByLabelText("open drawer");

    // drawer should be initially open
    expect(menuOpenButton).not.toBeVisible();

    // Click the chevron icon to close the drawer
    const chevronIcon = screen.getByTestId("close-menu");
    fireEvent.click(chevronIcon);

    // Drawer should be closed again
    expect(menuOpenButton).toBeVisible();

    // click the menu button to open the drawer
    fireEvent.click(menuOpenButton);

    // drawer should be open
    expect(menuOpenButton).not.toBeVisible();
  });

  it("should show profile menu on click", () => {
    renderRootLayout();

    const profileIcon = screen.getByTestId("account-menu-button");
    const profileMenu = screen.getByTestId("user-menu");

    // Profile menu should not be open initially
    expect(profileMenu).not.toBeVisible();

    // Click the profile icon to open the profile menu
    fireEvent.click(profileIcon);

    // Profile menu should be visible
    expect(profileMenu).toBeVisible();
  });

  it("should hide administration menus from a student", () => {
    store.dispatch(
      setUserInfo({
        ...operationalUser,
        id: 2,
        role: "student",
        email: "student@example.com",
      }),
    );

    renderRootLayout();

    MAIN_MENUS.forEach(item => {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    });
  });
});
