import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import store from "../../redux/store";
import ChangePassword from "./ChangePassword";

const renderChangePassword = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ChangePassword />
      </MemoryRouter>
    </Provider>,
  );

describe("Change Password Page", () => {
  afterEach(cleanup);

  it("renders the change password form", () => {
    renderChangePassword();

    expect(
      screen.getByRole("heading", { name: "Change Password" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
  });

  it("requires matching new passwords", async () => {
    renderChangePassword();

    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "CurrentPass123!" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "NewValidPass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "DifferentPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });
});
