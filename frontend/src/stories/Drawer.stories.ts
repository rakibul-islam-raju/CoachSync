import type { Meta, StoryObj } from "@storybook/react";
import CustomDrawer from "../components/CustomDrawer/CustomDrawer";

const meta = {
  title: "Drawer",
  component: CustomDrawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CustomDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Drawer: Story = {
  args: {
    open: true,
    position: "right",
    content: "hello world",
  },
};
