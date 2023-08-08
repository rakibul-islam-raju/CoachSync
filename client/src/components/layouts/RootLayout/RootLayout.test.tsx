import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import { MAIN_MENUS } from "./constants";

describe("Login Page", () => {
	afterEach(() => {
		cleanup();
	});
	// const user = userEvent.setup();

	it("should render correctly", () => {
		render(
			<MemoryRouter>
				<RootLayout />
			</MemoryRouter>
		);

		// Check if Login header is rendered
		expect(screen.getByText("Coaching Management System")).toBeInTheDocument();

		// Check if main menus are rendered
		MAIN_MENUS.forEach((item) => {
			const menuItem = screen.getByText(item.label);
			expect(menuItem).toBeInTheDocument();
		});
	});

	it("should toggle the drawer", () => {
		render(<RootLayout />);
		const menuOpenButton = screen.getByLabelText("open drawer");

		// drawer should be initially open
		expect(menuOpenButton).not.toBeVisible();

		// click the menu button to open the drawer
		fireEvent.click(menuOpenButton);

		// drawer should be open
		expect(menuOpenButton).not.toBeVisible();

		// Click the chevron icon to close the drawer
		const chevronIcon = screen.getByTestId("close-menu");
		fireEvent.click(chevronIcon);

		// Drawer should be closed again
		expect(menuOpenButton).toBeVisible();
	});

	it("should show profile menu on click", () => {
		render(<RootLayout />);

		const profileIcon = screen.getByTestId("account-menu-button");
		const profileMenu = screen.getByTestId("user-menu");

		// Profile menu should not be open initially
		expect(profileMenu).not.toBeVisible();

		// Click the profile icon to open the profile menu
		fireEvent.click(profileIcon);

		// Profile menu should be visible
		expect(profileMenu).toBeVisible();
	});
});
