// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ProposalList,
  SuspenseLoader,
  useDaoInfoContext,
} from '@dao-dao/common'
import { useVotingModule } from '@dao-dao/state'
import { Button, Loader, Tooltip } from '@dao-dao/ui'
import { usePlatform } from '@dao-dao/utils'

export const DaoProposals = () => {
  const { t } = useTranslation()

  return (
    <SuspenseLoader
      fallback={
        <div className="flex flex-col gap-4">
          <h2 className="primary-text">{t('title.proposals')}</h2>
          <Loader />
        </div>
      }
    >
      <InnerDaoProposals />
    </SuspenseLoader>
  )
}

const InnerDaoProposals = () => {
  const { t } = useTranslation()
  const { coreAddress } = useDaoInfoContext()
  const { isMember } = useVotingModule(coreAddress, { fetchMembership: true })
  const router = useRouter()

  // Detect if Mac for checking keypress.
  const { isMac } = usePlatform()

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (((!isMac && event.ctrlKey) || event.metaKey) && event.shiftKey) {
        if (event.key === 'p') {
          event.preventDefault()
          router.push(`/dao/${coreAddress}/proposals/create`)
        }
      }
    },
    [isMac, coreAddress, router]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const tooltip = isMember
    ? (isMac ? '⌘' : '⌃') + '⇧P'
    : t('error.mustBeMemberToCreateProposal')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="primary-text">{t('title.proposals')}</h2>

        <Link
          className={clsx({ 'pointer-events-none': isMember })}
          href={`/dao/${coreAddress}/proposals/create`}
        >
          <a>
            <Tooltip label={tooltip}>
              <Button disabled={!isMember} size="sm">
                {t('button.createAProposal')}
              </Button>
            </Tooltip>
          </a>
        </Link>
      </div>

      <div className="md:px-4">
        <ProposalList
          proposalCreateUrl={`/dao/${coreAddress}/proposals/create`}
          proposalUrlPrefix={`/dao/${coreAddress}/proposals/`}
        />
      </div>
    </div>
  )
}
