import { parseCoins } from '@cosmjs/proto-signing'
import { IndexedTx } from '@cosmjs/stargate'
import { selectorFamily, waitForAll } from 'recoil'

import {
  CwCoreVersion,
  convertMicroDenomToDenomWithDecimals,
  nativeTokenDecimals,
  nativeTokenLabel,
  parseCoreVersion,
} from '@dao-dao/utils'

import {
  blockHeightTimestampSafeSelector,
  cosmWasmClientSelector,
} from './chain'
import { CwCoreV0_1_0Selectors } from './clients'

export const contractInstantiateTimeSelector = selectorFamily<
  Date | undefined,
  string
>({
  key: 'contractInstantiateTime',
  get:
    (address: string) =>
    async ({ get }) => {
      const client = get(cosmWasmClientSelector)

      const events = await client.searchTx({
        tags: [{ key: 'instantiate._contract_address', value: address }],
      })
      if (events.length === 0) return

      return get(blockHeightTimestampSafeSelector(events[0].height))
    },
})

export const contractAdminSelector = selectorFamily<string | undefined, string>(
  {
    key: 'contractAdmin',
    get:
      (address: string) =>
      async ({ get }) => {
        const client = get(cosmWasmClientSelector)

        try {
          const contract = await client.getContract(address)
          return contract.admin
        } catch (_) {
          return undefined
        }
      },
  }
)

type TreasuryTransactionsParams = {
  address: string
  minHeight?: number
  maxHeight?: number
}

interface TreasuryTransaction {
  tx: IndexedTx
  timestamp: Date | undefined
  events: {
    type: string
    attributes: {
      key: string
      value: string
    }[]
  }[]
}

export const treasuryTransactionsSelector = selectorFamily<
  TreasuryTransaction[],
  TreasuryTransactionsParams
>({
  key: 'treasuryTransactions',
  get:
    ({ address, minHeight, maxHeight }) =>
    async ({ get }) => {
      const client = get(cosmWasmClientSelector)

      const txs = await client.searchTx(
        {
          sentFromOrTo: address,
        },
        {
          minHeight,
          maxHeight,
        }
      )

      const txDates = get(
        waitForAll(
          txs.map(({ height }) => blockHeightTimestampSafeSelector(height))
        )
      )

      return (
        txs
          .map((tx, index) => {
            let events
            try {
              events = JSON.parse(tx.rawLog)[0].events
            } catch {
              return
            }

            return {
              tx,
              timestamp: txDates[index],
              events,
            }
          })
          .filter(Boolean) as TreasuryTransaction[]
      ).sort((a, b) =>
        // Sort descending by timestamp, putting undefined timestamps last.
        b.timestamp && a.timestamp
          ? b.timestamp.getTime() - a.timestamp.getTime()
          : !a.timestamp
          ? 1
          : !b.timestamp
          ? -1
          : b.tx.height - a.tx.height
      )
    },
})

export interface TransformedTreasuryTransaction {
  hash: string
  height: number
  timestamp: Date | undefined
  sender: string
  recipient: string
  amount: number
  denomLabel: string
  outgoing: boolean
}

export const transformedTreasuryTransactionsSelector = selectorFamily<
  TransformedTreasuryTransaction[],
  TreasuryTransactionsParams
>({
  key: 'transformedTreasuryTransactions',
  get:
    (params) =>
    async ({ get }) => {
      const txs = get(treasuryTransactionsSelector(params))

      return txs
        .map(({ tx: { hash, height }, timestamp, events }) => {
          const transferEvent = events.find(({ type }) => type === 'transfer')
          if (!transferEvent) {
            return
          }

          let sender = transferEvent.attributes.find(
            ({ key }) => key === 'sender'
          )?.value
          let recipient = transferEvent.attributes.find(
            ({ key }) => key === 'recipient'
          )?.value
          const amount = transferEvent.attributes.find(
            ({ key }) => key === 'amount'
          )?.value

          if (!sender || !recipient || !amount) {
            return
          }

          const coin = parseCoins(amount)[0]
          if (!coin) {
            return
          }

          const tokenDecimals = nativeTokenDecimals(coin.denom)
          const tokenLabel = nativeTokenLabel(coin.denom)

          // Only convert value and denom at the same time. If decimals are
          // found but label is not for some reason (which should never happen)
          // or vice versa, display value in non-converted decimals with
          // non-converted denom.
          const amountValue =
            tokenDecimals !== undefined && tokenLabel !== undefined
              ? convertMicroDenomToDenomWithDecimals(coin.amount, tokenDecimals)
              : Number(coin.amount)
          const denomLabel =
            tokenDecimals !== undefined && tokenLabel !== undefined
              ? tokenLabel
              : coin.denom

          return {
            hash,
            height,
            timestamp,
            sender,
            recipient,
            amount: amountValue,
            denomLabel,
            outgoing: sender === params.address,
          }
        })
        .filter(Boolean) as TransformedTreasuryTransaction[]
    },
})

export const cwCoreVersionSelector = selectorFamily<CwCoreVersion, string>({
  key: 'cwCoreVersion',
  get:
    (coreAddress) =>
    async ({ get }) => {
      const coreInfo = get(
        CwCoreV0_1_0Selectors.infoSelector({ contractAddress: coreAddress })
      ).info

      const coreVersion = parseCoreVersion(coreInfo.version)
      if (!coreVersion) {
        throw new Error(
          `Failed parsing cw-core (${coreAddress}) version "${coreInfo.version}".`
        )
      }

      return coreVersion
    },
})
