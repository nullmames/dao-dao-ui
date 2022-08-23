import { CheckCircleIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { Copy } from '@dao-dao/icons'
import { Button } from '@dao-dao/ui'

const concatAddressImpl = (
  address: string,
  takeStart: number,
  takeEnd: number
) => {
  const first = address.substring(0, takeStart)
  const last = address.substring(address.length - takeEnd, address.length)
  return [first, last].filter(Boolean).join('...')
}

const concatAddress = (address: string, takeN = 7): string =>
  address && concatAddressImpl(address, takeN, takeN)

export interface CopyToClipboardProps {
  value: string
  success?: string
  takeN?: number
  takeStartEnd?: {
    start: number
    end: number
  }
  loading?: boolean
  className?: string
}

export const CopyToClipboard = ({
  value,
  success = 'Copied to clipboard!',
  takeN,
  takeStartEnd,
  className = 'font-mono text-xs',
}: CopyToClipboardProps) => {
  const [copied, setCopied] = useState(false)

  return (
    <button
      className={clsx(
        'flex overflow-hidden flex-row gap-1 items-center',
        className
      )}
      onClick={() => {
        navigator.clipboard.writeText(value)
        setTimeout(() => setCopied(false), 2000)
        setCopied(true)
        toast.success(success)
      }}
      title={value}
      type="button"
    >
      {copied ? (
        <CheckCircleIcon className="w-[18px]" />
      ) : (
        <Copy color="currentColor" height="18px" width="18px" />
      )}

      <span className="inline flex-1 p-1 truncate hover:bg-btn-secondary-hover rounded-md transition">
        {takeStartEnd
          ? concatAddressImpl(value, takeStartEnd.start, takeStartEnd.end)
          : concatAddress(value, takeN)}
      </span>
    </button>
  )
}

export const CopyToClipboardMobile = ({
  value,
  success = 'Copied to clipboard',
  takeN = 7,
}: CopyToClipboardProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex justify-between p-1 rounded-md border border-inactive">
      <div className="flex gap-2 items-center px-2 text-tertiary secondary-text">
        {copied ? (
          <CheckCircleIcon className="w-[18px]" />
        ) : (
          <Copy color="currentColor" height="18px" width="18px" />
        )}
        <span className="inline py-1 hover:bg-btn-secondary-hover transition">
          {concatAddress(value, takeN)}
        </span>
      </div>
      <Button
        onClick={() => {
          navigator.clipboard.writeText(value)
          setTimeout(() => setCopied(false), 2000)
          setCopied(true)
          toast.success(success)
        }}
        size="sm"
        variant="secondary"
      >
        <p className="text-body caption-text">{t('button.copy')}</p>
      </Button>
    </div>
  )
}
