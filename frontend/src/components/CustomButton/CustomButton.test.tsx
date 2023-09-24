import { describe, it, expect } from "vitest";
import { CustomButton } from "./CustomButton";
import { screen, render } from "@testing-library/react";

describe("CustomButton Component", () => {
  it("should render a contained button by default", () => {
    const onClickMock = () => {};
    render(<CustomButton onClick={onClickMock}>Contained Button</CustomButton>);
    const button = screen.getByRole("button", { name: /contained button/i });

    expect(button).toBeInTheDocument();
  });
});
