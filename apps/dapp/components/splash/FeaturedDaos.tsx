// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import {
  UIEventHandler,
  createRef,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useIsVisible } from '@/hooks'

import { FeaturedCard } from '../FeaturedCard'

export interface FeaturedDao {
  name: string
  description: string
  href: string
  TVL: number
  image: string
}

export interface FeaturedDaosProps {
  featuredDaos: FeaturedDao[]
}

export const FeaturedDaos = ({ featuredDaos }: FeaturedDaosProps) => {
  const [clonesWidth, setClonesWidth] = useState(0)
  const [autoscroll, setAutoscroll] = useState(true)

  const scrollRef = createRef<HTMLDivElement>()
  const mirrorRef = createRef<HTMLDivElement>()

  // Don't scroll this element if it isn't visible as the scrolling is
  // a reasonably heavy operation.
  const scrollVisible = useIsVisible(scrollRef)
  const mirrorVisible = useIsVisible(mirrorRef)
  const componentIsVisible = scrollVisible || mirrorVisible

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const container = e.currentTarget
      const scrollPos = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const divWidth = container.clientWidth

      if (scrollPos >= scrollWidth - divWidth) {
        // Scroll to the end of the non-clones. This will put us in a
        // position where we have the last element followed by the
        // clones. Subtracting div-width has the effect of placing the
        // end of the scroll view at the end of the clones.
        container.scrollLeft = clonesWidth - divWidth
      } else if (scrollPos <= 0) {
        // Scroll to the beginning of the clones. This will put us in
        // a position where we have the first element with the
        // non-clones behind us.
        container.scrollLeft = scrollWidth - clonesWidth
      }

      // Invert the scroll position of the mirror.
      if (mirrorRef && mirrorRef.current) {
        mirrorRef.current.scrollLeft =
          scrollWidth - divWidth - container.scrollLeft
      }
    },
    [clonesWidth, mirrorRef]
  )

  // Set the width of the clones once this component mounts.
  useEffect(() => {
    const clones = document.getElementsByClassName('is-clone')
    const clonesArray = Array.from(clones)
    const width = clonesArray.reduce(
      (accum, { clientWidth }) => accum + clientWidth,
      0
    )
    // We use 16 pixels of padding between each element so we need to
    // add that information when considering the width.
    setClonesWidth(width + 16 * clonesArray.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef && autoscroll && componentIsVisible) {
        scrollRef.current?.scrollBy(1, 0)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [scrollRef, autoscroll, componentIsVisible])

  return (
    <>
      <div
        className="overflow-auto w-screen no-scrollbar"
        onMouseEnter={() => setAutoscroll(false)}
        onMouseLeave={() => setAutoscroll(true)}
        onScroll={handleScroll}
        ref={scrollRef}
      >
        <div className="flex flex-row gap-[16px] py-1 w-max">
          {featuredDaos.map((props) => (
            <FeaturedCard {...props} key={props.name} className="!w-[260px]" />
          ))}
          {featuredDaos.map((props) => (
            <FeaturedCard
              {...props}
              key={props.name}
              className="!w-[260px] is-clone"
            />
          ))}
        </div>
      </div>
    </>
  )
}
