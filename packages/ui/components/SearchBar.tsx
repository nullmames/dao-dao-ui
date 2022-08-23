import { SearchIcon } from '@heroicons/react/solid'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

export interface SearchBarProps extends Omit<ComponentProps<'input'>, 'type'> {
  containerClassName?: string
  hideIcon?: boolean
}

export const SearchBar = ({
  containerClassName,
  className,
  hideIcon,
  ...props
}: SearchBarProps) => {
  const { t } = useTranslation()

  return (
    <div
      className={clsx(
        'flex items-center px-3 text-tertiary border-b border-default',
        containerClassName
      )}
    >
      {!hideIcon && <SearchIcon className="w-5" />}

      <input
        autoFocus
        className={clsx(
          'p-4 w-full bg-transparent focus:outline-none primary-text focus:ring-none',
          className
        )}
        placeholder={t('title.search')}
        type="text"
        {...props}
      />
    </div>
  )
}
