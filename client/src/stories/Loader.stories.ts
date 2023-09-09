import type { Meta, StoryObj } from "@storybook/react";
import Loader from "../components/Loader";

const meta: Meta<typeof Loader> = {
  title: "Loader",
  component: Loader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "error", "info"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    color: "primary",
  },
};
