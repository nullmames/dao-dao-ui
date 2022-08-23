// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import { ChevronRightIcon } from '@heroicons/react/outline'
import { useTranslation } from 'react-i18next'

import { Button } from '@dao-dao/ui'

interface BetaWarningModalProps {
  onAccept: () => void
}

export const BetaWarningModal = ({ onAccept }: BetaWarningModalProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex fixed z-10 justify-center items-center w-screen h-full backdrop-blur-sm backdrop-filter">
      <div className="p-6 max-w-md h-min bg-white rounded-lg border border-focus">
        <div className="mb-6 rounded-md prose prose-sm dark:prose-invert">
          <h2>{t('title.beforeYouEnter')}</h2>
          <p>{t('info.tos')}</p>
        </div>
        <Button onClick={onAccept}>
          {t('button.acceptTerms')}
          <ChevronRightIcon className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
