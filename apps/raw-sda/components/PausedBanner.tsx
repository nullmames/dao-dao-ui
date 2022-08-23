import { PauseIcon } from '@heroicons/react/outline'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { CwCoreV0_1_0Selectors, blockHeightSelector } from '@dao-dao/state'
import { Duration, Expiration } from '@dao-dao/state/clients/cw-core/0.1.0'
import { humanReadableDuration } from '@dao-dao/utils'

import { DAO_ADDRESS } from '@/util'

export interface PausedBannerProps {}

export const remainingTime = (
  expiration: Expiration | undefined,
  blockHeight: number
): Duration => {
  if (!expiration) {
    return { time: 0 }
  }
  if ('at_height' in expiration) {
    const releaseBlock = expiration.at_height
    return { height: releaseBlock - blockHeight }
  } else if ('at_time' in expiration) {
    const currentTimeNs = new Date().getTime() * 1000000
    return {
      time: (Number(expiration.at_time) - currentTimeNs) / 1000000000 || 0, // To seconds.
    }
  }

  // Unreachable.
  return { time: 0 }
}

export const PausedBanner = ({}: PausedBannerProps) => {
  const { t } = useTranslation()
  const pauseInfo = useRecoilValue(
    CwCoreV0_1_0Selectors.pauseInfoSelector({ contractAddress: DAO_ADDRESS })
  )
  const blockHeight = useRecoilValue(blockHeightSelector)

  const expiration =
    'Paused' in pauseInfo ? pauseInfo.Paused.expiration : undefined

  const [remaining, setRemaining] = useState(
    remainingTime(expiration, blockHeight as number)
  )

  useEffect(() => {
    const interval = setInterval(() =>
      setRemaining(remainingTime(expiration, blockHeight as number))
    )
    return () => {
      clearInterval(interval)
    }
  })

  if (!pauseInfo || !('Paused' in pauseInfo)) {
    return null
  }

  return (
    <div
      className="flex gap-1 justify-center items-center py-4 px-3 w-full rounded-lg"
      style={{
        background:
          'radial-gradient(72.67% 293.01% at 0.42% 98.15%, rgba(221, 60, 101, 0.2) 0%, rgba(28, 29, 30, 0.2) 94.25%)',
      }}
    >
      <PauseIcon className="w-5" />
      <p className="link-text">
        {t('info.daoPaused', { duration: humanReadableDuration(remaining) })}
      </p>
    </div>
  )
}
