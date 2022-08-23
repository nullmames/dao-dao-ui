import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'

import { PercentButton } from 'components/StakingModal/PercentSelector'

export default {
  title: 'DAO DAO UI / StakingModal / PercentButton',
  component: PercentButton,
} as ComponentMeta<typeof PercentButton>

const Template: ComponentStory<typeof PercentButton> = (args) => {
  const [amount, setAmount] = useState(50)

  return <PercentButton {...args} amount={amount} setAmount={setAmount} />
}

export const Default = Template.bind({})
Default.args = {
  label: '25%',
  max: 1234,
  percent: 0.25,
  tokenDecimals: 6,
}
