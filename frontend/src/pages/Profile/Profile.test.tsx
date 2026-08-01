import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setUserInfo, userLoggedOut } from "../../redux/auth/authSlice";
import store from "../../redux/store";
import { useUpdateProfileMutation } from "../../redux/user/userApi";
import Profile from "./Profile";

vi.mock("../../redux/user/userApi", async importOriginal => {
  const original =
    await importOriginal<typeof import("../../redux/user/userApi")>();
  return { ...original, useUpdateProfileMutation: vi.fn() };
});

describe("Profile", () => {
  const updateProfile = vi.fn();

  beforeEach(() => {
    store.dispatch(
      setUserInfo({
        id: 1,
        first_name: "Old",
        last_name: "Name",
        full_name: "Old Name",
        phone: "01700000001",
        email: "profile@example.com",
        is_active: true,
        is_staff: false,
        is_superuser: false,
        role: "org_staff",
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );
    vi.mocked(useUpdateProfileMutation).mockReturnValue([
      updateProfile,
      { isLoading: false, isSuccess: false, isError: false },
    ] as unknown as ReturnType<typeof useUpdateProfileMutation>);
  });

  afterEach(() => {
    store.dispatch(userLoggedOut());
    vi.clearAllMocks();
  });

  it("submits editable fields while security-sensitive fields stay disabled", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Role")).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "New" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(updateProfile).toHaveBeenCalledWith({
      first_name: "New",
      last_name: "Name",
      phone: "01700000001",
    });
  });
});
