import type { Meta, StoryObj } from "@storybook/react";
import { default as LoaderComponent } from "../components/Loader";

const meta: Meta<typeof LoaderComponent> = {
  title: "Loader",
  component: LoaderComponent,
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

export const Loader: Story = {
  args: {
    color: "primary",
  },
};
