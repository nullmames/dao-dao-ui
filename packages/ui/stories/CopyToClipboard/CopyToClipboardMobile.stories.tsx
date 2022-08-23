import { ComponentMeta, ComponentStory } from '@storybook/react'

import { CopyToClipboardMobile } from 'components/CopyToClipboard'

export default {
  title: 'DAO DAO UI / CopyToClipboardMobile',
  component: CopyToClipboardMobile,
} as ComponentMeta<typeof CopyToClipboardMobile>

const Template: ComponentStory<typeof CopyToClipboardMobile> = (args) => (
  <CopyToClipboardMobile {...args} />
)

export const Default = Template.bind({})
Default.args = {
  value: 'Click me to copy me',
}

// TODO: Fix story.
