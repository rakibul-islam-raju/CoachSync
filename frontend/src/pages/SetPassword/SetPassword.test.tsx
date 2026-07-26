import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import store from "../../redux/store";
import SetPassword from "./SetPassword";

const renderSetPassword = () =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/set-password/reset-token"]}>
        <Routes>
          <Route path="/set-password/:token" element={<SetPassword />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe("Set Password Page", () => {
  afterEach(cleanup);

  it("renders the password reset form", () => {
    renderSetPassword();

    expect(screen.getByText("Set Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("requires matching passwords", async () => {
    renderSetPassword();

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "ValidPass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "DifferentPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Password" }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });
});
