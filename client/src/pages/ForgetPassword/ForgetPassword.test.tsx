import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ForgetPassword from "./ForgetPassword";

describe("Login Page", () => {
	afterEach(() => {
		cleanup();
	});
	// const user = userEvent.setup();

	it("should render correctly", () => {
		render(
			<MemoryRouter>
				<ForgetPassword />
			</MemoryRouter>
		);

		// Check if header is rendered
		expect(screen.getByText("Reset Password")).toBeInTheDocument();

		// Check if email input is rendered
		expect(
			screen.getByPlaceholderText("Enter Email Address")
		).toBeInTheDocument();

		// Check if submit button is rendered
		expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
	});

	it("should show error for invalid email and password submission", async () => {
		render(
			<MemoryRouter>
				<ForgetPassword />
			</MemoryRouter>
		);

		const emailInput = screen.getByPlaceholderText("Enter Email Address");
		const submitButton = screen.getByRole("button", { name: "Submit" });

		// Type an invalid email address
		fireEvent.change(emailInput, { target: { value: "invalid-email" } });

		// Click the submit button
		fireEvent.click(submitButton);

		// Wait for the validation error message to appear
		const emailError = await screen.findByText("Invalid email");

		// Expect validation errors to be displayed
		expect(emailError).toBeInTheDocument();
	});
});
