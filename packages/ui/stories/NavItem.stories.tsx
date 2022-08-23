import { ComponentMeta, ComponentStory } from '@storybook/react'

import { Pie } from '@dao-dao/icons'

import { NavItem } from 'components/NavItem'

export default {
  title: 'DAO DAO UI / NavItem',
  component: NavItem,
} as ComponentMeta<typeof NavItem>

const Template: ComponentStory<typeof NavItem> = (args) => <NavItem {...args} />

export const Default = Template.bind({})
Default.args = {
  item: {
    renderIcon: (color, mobile) => (
      <Pie color={color} height={mobile ? 16 : 14} width={mobile ? 16 : 14} />
    ),
    label: 'Stake',
    href: '/',
    active: false,
    external: false,
  },
}
