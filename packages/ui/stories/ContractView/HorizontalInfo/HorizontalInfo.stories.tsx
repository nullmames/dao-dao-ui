/* eslint-disable i18next/no-literal-string */
import { ComponentMeta, ComponentStory } from '@storybook/react'

import {
  HorizontalInfo,
  HorizontalInfoSection,
} from 'components/ContractView/HorizontalInfo'

export default {
  title: 'DAO DAO UI / ContractView / HorizontalInfo',
  component: HorizontalInfo,
} as ComponentMeta<typeof HorizontalInfo>

const Template: ComponentStory<typeof HorizontalInfo> = (args) => (
  <HorizontalInfo {...args} />
)

export const Default = Template.bind({})
Default.args = {
  children: (
    <>
      <HorizontalInfoSection>Section 1</HorizontalInfoSection>
      <HorizontalInfoSection>Section 2</HorizontalInfoSection>
    </>
  ),
}
