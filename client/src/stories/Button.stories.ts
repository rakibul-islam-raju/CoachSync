import type { Meta, StoryObj } from "@storybook/react";
import { CustomButton } from "../components/CustomButton/CustomButton";

const meta = {
  title: "Button",
  component: CustomButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Button: Story = {
  args: {
    variant: "contained",
    children: "Button",
  },
};
