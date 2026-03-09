import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs } from "./Tabs";

const meta = {
  component: Tabs,
  tags: ["autodocs"],
  title: "UI/Tabs",
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return (
      <Tabs className="max-w-md" defaultValue="profile">
        <Tabs.List>
          <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
          <Tabs.Trigger value="settings">설정</Tabs.Trigger>
          <Tabs.Trigger value="security">보안</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="profile">프로필 콘텐츠입니다.</Tabs.Content>
        <Tabs.Content value="settings">설정 콘텐츠입니다.</Tabs.Content>
        <Tabs.Content value="security">보안 콘텐츠입니다.</Tabs.Content>
      </Tabs>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    return (
      <Tabs className="max-w-md" onValueChange={(value) => console.log(value)} value="profile">
        <Tabs.List>
          <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
          <Tabs.Trigger value="settings">설정</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="profile">외부 상태로 제어되는 탭입니다.</Tabs.Content>
        <Tabs.Content value="settings">value를 바꾸면 이 콘텐츠가 표시됩니다.</Tabs.Content>
      </Tabs>
    );
  },
};
