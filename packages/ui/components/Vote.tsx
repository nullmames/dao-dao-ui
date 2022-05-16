import { CheckIcon, XIcon } from '@heroicons/react/outline'
import { FC, useState } from 'react'

import { Abstain, Airplane } from '@dao-dao/icons'
import { Vote as VoteChoice } from '@dao-dao/state/clients/cw-proposal-single'
import { Button } from '@dao-dao/ui'

export { VoteChoice }

export interface VoteProps {
  onVote: (choice: VoteChoice) => void
  voterWeight: number
  loading: boolean
}

export const Vote: FC<VoteProps> = ({ onVote, voterWeight, loading }) => {
  const [selected, setSelected] = useState<VoteChoice | undefined>()

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center p-4 max-w-3xl bg-primary rounded-lg border border-default">
      <div className="flex gap-2 items-center">
        <p className="mr-1 text-2xl">🗳</p>
        <p className="primary-text">Casting</p>
        <p className="secondary-text">
          {voterWeight.toLocaleString(undefined, {
            maximumSignificantDigits: 4,
          })}
          % voting power
        </p>
      </div>
      <div className="flex flex-wrap grid-cols-3 gap-2 md:grid">
        <Button
          className={`group transition ${
            selected === VoteChoice.Yes ? 'bg-valid hover:bg-valid' : ''
          }`}
          onClick={() =>
            setSelected((s) =>
              s === VoteChoice.Yes ? undefined : VoteChoice.Yes
            )
          }
          variant="secondary"
        >
          <CheckIcon
            className={`${
              selected === VoteChoice.Yes
                ? 'text-base'
                : 'text-valid group-hover:text-base'
            } w-4`}
          />
          Yes
        </Button>
        <Button
          className={`group transition ${
            selected === VoteChoice.Abstain
              ? 'bg-tertiary hover:bg-tertiary'
              : ''
          }`}
          onClick={() =>
            setSelected((s) =>
              s === VoteChoice.Abstain ? undefined : VoteChoice.Abstain
            )
          }
          variant="secondary"
        >
          <Abstain fill="currentColor" />
          Abstain
        </Button>
        <Button
          className={`group transition ${
            selected === VoteChoice.No ? 'bg-error hover:bg-error' : ''
          }`}
          onClick={() =>
            setSelected((s) =>
              s === VoteChoice.No ? undefined : VoteChoice.No
            )
          }
          variant="secondary"
        >
          <XIcon
            className={`${
              selected === VoteChoice.No
                ? 'text-base'
                : 'text-error group-hover:text-base'
            } w-4`}
          />
          No
        </Button>
      </div>
      <Button
        disabled={selected === undefined}
        loading={loading}
        onClick={() => onVote(selected as VoteChoice)}
      >
        Vote <Airplane stroke="currentColor" />
      </Button>
    </div>
  )
}