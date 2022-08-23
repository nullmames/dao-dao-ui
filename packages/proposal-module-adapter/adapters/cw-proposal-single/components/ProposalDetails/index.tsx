import { DuplicateIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { constSelector, useRecoilValue } from 'recoil'

import { ActionAndData, ActionKey, ActionsRenderer } from '@dao-dao/actions'
import { Trans } from '@dao-dao/common'
import {
  CwCoreV0_1_0Selectors,
  CwProposalSingleHooks,
  CwProposalSingleSelectors,
  useVotingModule,
} from '@dao-dao/state'
import { Status } from '@dao-dao/state/clients/cw-proposal-single'
import {
  Button,
  CloseProposal,
  CosmosMessageDisplay,
  ExecuteProposal,
  MarkdownPreview,
} from '@dao-dao/ui'
import {
  decodeMessages,
  decodedMessagesString,
  processError,
} from '@dao-dao/utils'

import { useProposalModuleAdapterOptions } from '../../../../react/context'
import { BaseProposalDetailsProps } from '../../../../types'
import { VoteDisplay } from '../VoteDisplay'
import { Vote, VoteChoice } from './Vote'

export const ProposalDetails = ({
  actions,
  onExecuteSuccess,
  onCloseSuccess,
  onVoteSuccess,
  connected,
  ConnectWalletButton,
  duplicate,
  walletAddress,
  VotingPowerWidget,
}: BaseProposalDetailsProps) => {
  const { t } = useTranslation()
  const { coreAddress, proposalModule, proposalNumber, Loader, Logo } =
    useProposalModuleAdapterOptions()
  const { isMember } = useVotingModule(coreAddress, { fetchMembership: true })

  const config = useRecoilValue(
    CwProposalSingleSelectors.configSelector({
      contractAddress: proposalModule.address,
    })
  )
  const { proposal } = useRecoilValue(
    CwProposalSingleSelectors.proposalSelector({
      contractAddress: proposalModule.address,
      params: [
        {
          proposalId: proposalNumber,
        },
      ],
    })
  )

  const walletVote = useRecoilValue(
    walletAddress
      ? CwProposalSingleSelectors.getVoteSelector({
          contractAddress: proposalModule.address,
          params: [{ proposalId: proposalNumber, voter: walletAddress }],
        })
      : constSelector(undefined)
  )?.vote?.vote

  const walletVotingPowerWhenProposalCreated = Number(
    useRecoilValue(
      walletAddress
        ? CwCoreV0_1_0Selectors.votingPowerAtHeightSelector({
            contractAddress: coreAddress,
            params: [
              {
                address: walletAddress,
                height: proposal.start_height,
              },
            ],
          })
        : constSelector(undefined)
    )?.power ?? '0'
  )
  const walletVotingPowerWhenProposalCreatedPercent =
    walletVotingPowerWhenProposalCreated
      ? (walletVotingPowerWhenProposalCreated / Number(proposal.total_power)) *
        100
      : 0

  const memberWhenProposalCreated = connected
    ? walletVotingPowerWhenProposalCreated > 0
    : undefined

  const decodedMessages = useMemo(
    () => decodeMessages(proposal.msgs),
    [proposal.msgs]
  )
  const [showRaw, setShowRaw] = useState(false)

  const canVote =
    proposal.status === Status.Open &&
    (config.allow_revoting || !walletVote) &&
    memberWhenProposalCreated

  // Ensure the last two actions are execute smart contract followed by
  // custom, since a lot of actions are smart contract executions, and custom
  // is a catch-all that will display any message. Do this by assigning values
  // and sorting the actions in ascending order.
  const orderedActions = useMemo(() => {
    const keyToValue = (key: ActionKey) =>
      key === ActionKey.Execute ? 1 : key === ActionKey.Custom ? 2 : 0

    return actions.sort((a, b) => {
      const aValue = keyToValue(a.key)
      const bValue = keyToValue(b.key)
      return aValue - bValue
    })
  }, [actions])

  // Call relevant action hooks in the same order every time.
  const actionData: ActionAndData[] = decodedMessages.map((message) => {
    const { data, action } = orderedActions
      .map((action) => ({
        action,
        ...action.useDecodedCosmosMsg(message, coreAddress, proposalModule),
      }))
      // There will always be a match since custom matches all.
      .find(({ match }) => match)!

    return {
      action,
      data,
    }
  })

  // Scroll to hash manually if available since this component and thus
  // the desired target anchor text won't be ready right when the page
  // renders.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      // Ignore the '#' character at the beginning.
      const element = document.getElementById(window.location.hash.slice(1))
      if (!element) {
        return
      }

      // 24px offset so the element isn't touching the edge of the browser.
      const top = element.getBoundingClientRect().top + window.scrollY - 24
      window.scrollTo({
        top,
        behavior: 'smooth',
      })
    }
  }, [])

  const castVote = CwProposalSingleHooks.useCastVote({
    contractAddress: proposalModule.address,
    sender: walletAddress ?? '',
  })
  const executeProposal = CwProposalSingleHooks.useExecute({
    contractAddress: proposalModule.address,
    sender: walletAddress ?? '',
  })
  const closeProposal = CwProposalSingleHooks.useClose({
    contractAddress: proposalModule.address,
    sender: walletAddress ?? '',
  })

  const [loading, setLoading] = useState(false)

  const onVote = useCallback(
    async (vote: VoteChoice) => {
      if (!connected) return

      setLoading(true)

      try {
        await castVote({
          proposalId: proposalNumber,
          vote,
        })

        await onVoteSuccess()
      } catch (err) {
        console.error(err)
        toast.error(processError(err))
      } finally {
        setLoading(false)
      }
    },
    [connected, setLoading, castVote, proposalNumber, onVoteSuccess]
  )

  const onExecute = useCallback(async () => {
    if (!connected) return

    setLoading(true)

    try {
      await executeProposal({
        proposalId: proposalNumber,
      })

      await onExecuteSuccess()
    } catch (err) {
      console.error(err)
      toast.error(processError(err))
    } finally {
      setLoading(false)
    }
  }, [connected, setLoading, executeProposal, proposalNumber, onExecuteSuccess])

  const onClose = useCallback(async () => {
    if (!connected) return

    setLoading(true)

    try {
      await closeProposal({
        proposalId: proposalNumber,
      })

      await onCloseSuccess()
    } catch (err) {
      console.error(err)
      toast.error(processError(err))
    } finally {
      setLoading(false)
    }
  }, [connected, setLoading, closeProposal, proposalNumber, onCloseSuccess])

  const onDuplicate = () =>
    duplicate({
      title: proposal.title,
      description: proposal.description,
      actionData: actionData.map(({ action: { key }, data }) => ({
        key,
        data,
      })),
    })

  return (
    <div>
      <div className="max-w-prose">
        <h1 className="header-text">{proposal.title}</h1>
      </div>
      <div className="mt-6">
        <MarkdownPreview markdown={proposal.description} />
      </div>
      {!!decodedMessages?.length && (
        <>
          <div className="mt-9 mb-3 font-mono caption-text">
            {t('title.actions', { count: decodedMessages.length })}
          </div>
          {showRaw ? (
            <CosmosMessageDisplay
              value={decodedMessagesString(proposal.msgs)}
            />
          ) : (
            <ActionsRenderer
              Loader={Loader}
              Logo={Logo}
              actionData={actionData}
              coreAddress={coreAddress}
              proposalModule={proposalModule}
            />
          )}
        </>
      )}
      {!!decodedMessages.length && (
        <div className="flex flex-row gap-2 items-center mt-4">
          <Button
            onClick={() => setShowRaw((s) => !s)}
            size="sm"
            variant="secondary"
          >
            {showRaw ? (
              <>
                {t('button.hideRawData')}
                <EyeOffIcon className="inline ml-1 h-4 stroke-current" />
              </>
            ) : (
              <>
                {t('button.showRawData')}
                <EyeIcon className="inline ml-1 h-4 stroke-current" />
              </>
            )}
          </Button>
          <Button onClick={onDuplicate} size="sm" variant="secondary">
            {t('button.duplicate')}
            <DuplicateIcon className="inline ml-1 h-4 stroke-current" />
          </Button>
        </div>
      )}

      {proposal.status === Status.Passed &&
        // Show if anyone can execute OR if the wallet is a member.
        (!config.only_members_execute || isMember) && (
          <>
            <p className="mt-6 mb-4 link-text">{t('title.status')}</p>
            <ExecuteProposal
              loading={loading}
              messages={proposal.msgs.length}
              onExecute={onExecute}
            />
          </>
        )}
      {proposal.status === Status.Rejected && (
        <>
          <p className="mt-6 mb-4 link-text">{t('title.status')}</p>
          <CloseProposal
            loading={loading}
            onClose={onClose}
            willRefundProposalDeposit={
              proposal.deposit_info?.refund_failed_proposals ?? false
            }
          />
        </>
      )}

      <p className="mt-6 mb-4 font-mono caption-text">{t('title.vote')}</p>

      {connected ? (
        <>
          {walletVote && (
            <p
              className={clsx('flex flex-row gap-2 items-center body-text', {
                'mb-2': config.allow_revoting && canVote,
              })}
            >
              <Trans
                Loader={Loader}
                components={[<VoteDisplay key="vote" vote={walletVote} />]}
                i18nKey="info.votedOnProposal"
              />
              {config.allow_revoting && canVote && ' ' + t('info.voteAgain')}
            </p>
          )}
          {canVote && (
            <Vote
              loading={loading}
              onVote={onVote}
              voterWeightPercent={walletVotingPowerWhenProposalCreatedPercent}
            />
          )}
          {proposal.status !== Status.Open && !walletVote && (
            <p className="body-text">{t('info.didNotVote')}</p>
          )}
          {!memberWhenProposalCreated && (
            <p className="max-w-prose body-text">
              {t('info.mustHaveVotingPowerAtCreation')}{' '}
              {VotingPowerWidget && (
                <VotingPowerWidget
                  depositInfo={proposal.deposit_info ?? undefined}
                />
              )}
            </p>
          )}
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </div>
  )
}
