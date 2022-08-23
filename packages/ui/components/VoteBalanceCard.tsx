import { formatPercentOf100 } from '@dao-dao/utils'

import { BalanceIcon } from './ContractView'
import { CopyToClipboard } from './CopyToClipboard'

export interface VoteBalanceCardProps {
  weight: number
  title: string
  weightTotal: number
  addrTitle?: boolean
}

export const VoteBalanceCard = ({
  weight,
  title,
  weightTotal,
  addrTitle,
}: VoteBalanceCardProps) => (
  <div className="py-4 px-6 w-full rounded-lg border border-default">
    {addrTitle ? (
      <CopyToClipboard value={title} />
    ) : (
      <h2 className="font-mono caption-text">{title}</h2>
    )}
    <div className="flex flex-row flex-wrap gap-2 items-center mt-5 mb-[22px] title-text">
      <BalanceIcon />
      {weight}
      <span className="inline secondary-text">
        {formatPercentOf100(
          weightTotal === 0 ? 0 : (weight / weightTotal) * 100
        )}
      </span>
    </div>
  </div>
)
