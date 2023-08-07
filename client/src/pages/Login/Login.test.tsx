import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import Login from ".";
import { MemoryRouter } from "react-router-dom";

describe("Login Page", () => {
	afterEach(() => {
		cleanup();
	});
	// const user = userEvent.setup();

	it("should render correctly", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		);

		// Check if Login header is rendered
		expect(screen.getByText("Login")).toBeInTheDocument();

		// Check if email input is rendered
		expect(
			screen.getByPlaceholderText("Enter Email Address")
		).toBeInTheDocument();

		// Check if password input is rendered
		expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();

		// Check if submit button is rendered
		expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
	});

	it("should toggle password visibility", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		);

		// Initially, password should be hidden
		const passwordInput = screen.getByPlaceholderText("Enter Password");
		expect(passwordInput.getAttribute("type")).toBe("password");

		// Click on the visibility icon to toggle password visibility
		const visibilityButton = screen.getByTestId("visibility-button");
		fireEvent.click(visibilityButton);

		// Password should now be visible
		expect(passwordInput.getAttribute("type")).toBe("text");
	});

	it("should show error for invalid email and password submission", async () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		);

		const emailInput = screen.getByPlaceholderText("Enter Email Address");
		const passwordInput = screen.getByPlaceholderText("Enter Password");
		const submitButton = screen.getByRole("button", { name: "Submit" });

		// Type an invalid email address
		fireEvent.change(emailInput, { target: { value: "invalid-email" } });
		fireEvent.change(passwordInput, { target: { value: "123" } });

		// Click the submit button
		fireEvent.click(submitButton);

		// Wait for the validation error message to appear
		const emailError = await screen.findByText("Invalid email");
		const passwordError = await screen.findByText(
			"String must contain at least 4 character(s)"
		);

		// Expect validation errors to be displayed
		expect(emailError).toBeInTheDocument();
		expect(passwordError).toBeInTheDocument();
	});
});
