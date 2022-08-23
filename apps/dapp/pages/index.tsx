// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import { ArrowNarrowRightIcon } from '@heroicons/react/solid'
import type { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SuspenseLoader } from '@dao-dao/common'
import { serverSideTranslations } from '@dao-dao/i18n/serverSideTranslations'
import { ArrowUpRight } from '@dao-dao/icons'
import {
  Button,
  GradientWrapper,
  Logo,
  PageLoader,
  RotatableLogo,
} from '@dao-dao/ui'
import {
  CI,
  FEATURED_DAOS_CACHE_SECONDS,
  FEATURED_DAOS_URL,
} from '@dao-dao/utils'

import {
  AnouncementCard,
  EnterAppButton,
  FeaturedDao,
  FeaturedDaos,
  HomepageCards,
  StatsCard,
} from '@/components'

interface HomePageProps {
  featuredDaos: FeaturedDao[]
}

const Home: NextPage<HomePageProps> = ({ featuredDaos }) => {
  const { t } = useTranslation()

  const [tvl, setTVL] = useState<number>()
  const [daos, setDaos] = useState<number>()
  const [proposals, setProposals] = useState<number>()

  useEffect(() => {
    fetch('https://dao-stats.withoutdoing.com/mainnet/balances.json')
      .then((response) => response.json())
      .then((data) => setTVL(data[data.length - 1].value))
    fetch('https://dao-stats.withoutdoing.com/mainnet/count.json')
      .then((response) => response.json())
      .then((data) => setDaos(data[data.length - 1].value))
    fetch('https://dao-stats.withoutdoing.com/mainnet/proposals.json')
      .then((response) => response.json())
      .then((data) => setProposals(data[data.length - 1].value))
  }, [])

  return (
    <SuspenseLoader fallback={<PageLoader className="w-screen h-screen" />}>
      <GradientWrapper>
        <nav className="py-4 px-6 w-full bg-clip-padding bg-opacity-40 border-b border-inactive backdrop-blur-xl backdrop-filter">
          <div className="flex justify-between items-center mx-auto max-w-screen-lg">
            <Link href="/" passHref>
              <a className="flex items-center">
                <div className="mr-3">
                  <Logo size={32} />
                </div>
                <p className="mr-1 font-medium">DAO</p>
                <p
                  className="font-semibold text-secondary"
                  style={{ transform: 'scaleY(-1) scaleX(-1)' }}
                >
                  DAO
                </p>
              </a>
            </Link>
            <div className="flex gap-4 items-center">
              <a
                className="flex gap-2 items-center"
                href="https://docs.daodao.zone"
              >
                {t('splash.documentation')}
                <ArrowUpRight color="currentColor" height="10px" width="10px" />
              </a>
              <div className="hidden md:block">
                <EnterAppButton small />
              </div>
            </div>
          </div>
        </nav>
        <h1 className="mt-16 text-center md:mt-[33vh] hero-text">
          {t('splash.shortTagline')}
        </h1>
        <p className="px-4 my-10 mx-auto max-w-lg text-lg text-center text-secondary">
          {t('splash.longTagline')}
        </p>
        <div className="mx-auto">
          <EnterAppButton />
        </div>
        <div className="my-12 mx-auto md:my-20">
          <AnouncementCard />
        </div>

        <FeaturedDaos featuredDaos={featuredDaos} />

        <div className="flex flex-col grid-cols-3 gap-6 justify-around py-6 divide-focus md:grid md:gap-3 md:py-8 md:divide-x">
          <StatsCard>
            <h3 className="header-text">
              {tvl
                ? '$' +
                  tvl.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : t('info.loading')}
            </h3>
            <p className="caption-text">{t('splash.usdcTotalValue')}</p>
          </StatsCard>
          <StatsCard>
            <h3 className="header-text">
              {daos ? daos.toLocaleString() : t('info.loading')}
            </h3>
            <p className="caption-text">{t('splash.daosCreated')}</p>
          </StatsCard>
          <StatsCard>
            <h3 className="header-text">
              {proposals ? proposals.toLocaleString() : t('info.loading')}
            </h3>
            <p className="caption-text">{t('splash.proposalsCreated')}</p>
          </StatsCard>
        </div>

        <div className="px-3 -mt-8">
          <div className="flex gap-4 justify-center mt-12 w-full md:px-3 md:mt-28">
            <RotatableLogo initialRotation={135} />
            <RotatableLogo initialRotation={90} />
            <RotatableLogo initialRotation={45} />
          </div>
          <h2 className="px-4 mt-12 w-full text-center header-text">
            {t('splash.transparentGovernanceOnChain')}
          </h2>
          <p className="px-4 mx-auto mt-4 max-w-xl text-center text-tertiary primary-text">
            {t('splash.transparencyExplanation')}
          </p>
          <div className="mt-12">
            <HomepageCards />
          </div>
          <div className="flex flex-col gap-4 items-center my-12">
            <h2 className="mx-4 max-w-xl text-center header-text">
              {t('splash.createExploreJoin')}
            </h2>
            <Link href="/home">
              <a>
                <Button size="lg">
                  {t('splash.cta')}
                  <ArrowUpRight
                    color="currentColor"
                    height="10px"
                    width="10px"
                  />
                </Button>
              </a>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 my-10 font-mono md:grid-cols-3 caption-text">
            <div className="flex flex-wrap gap-6 items-center mx-2 text-xs">
              <p>
                {t('info.productVersion', {
                  versionNumber: process.env.NEXT_PUBLIC_DAO_DAO_VERSION,
                })}
              </p>
              <a
                className="hover:text-primary transition"
                href="https://www.junonetwork.io/"
                rel="noreferrer"
                target="_blank"
              >
                {t('splash.poweredByJuno')}
                <ArrowNarrowRightIcon
                  className="inline mb-0.5 w-6 h-4 font-light"
                  style={{ transform: 'rotateY(0deg) rotate(-45deg)' }}
                />
              </a>
            </div>
          </div>
        </div>
      </GradientWrapper>
    </SuspenseLoader>
  )
}

export default Home

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const featuredDaos: FeaturedDao[] = []
  if (!CI) {
    const resp = await fetch(FEATURED_DAOS_URL)
    // These are returned as a timeseries in the form [{time, value}, ...].
    const featuredDaosOverTime = await resp.json()
    featuredDaos.push(
      ...featuredDaosOverTime[featuredDaosOverTime.length - 1].value
    )
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['translation'])),
      featuredDaos,
    },
    revalidate: FEATURED_DAOS_CACHE_SECONDS,
  }
}
