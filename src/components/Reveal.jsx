import { useEffect, useRef, useState } from 'react'

/**
 * Reusable scroll-reveal wrapper. Fades (+ slides) an element in once it
 * enters the viewport, using IntersectionObserver (no extra dependency).
 * Honors prefers-reduced-motion by skipping straight to visible.
 *
 * direction:
 *   'up'   (default) — fade + slide up, for headings/sections
 *   'left' — fade + slide in from the left, for card-grid stagger
 *            (pair with delay = index * staggerMs for left-to-right order)
 *   'fade' — opacity only, no transform — for cards inside a horizontal
 *            swipe/scroll carousel, so the reveal never fights the gesture
 *
 * Usage:
 *   <Reveal><section>...</section></Reveal>
 *   <Reveal as="h2" delay={80} className="text-3xl font-bold">Title</Reveal>
 *   <Reveal direction="left" delay={index * 80}><Card /></Reveal>
 */
const Reveal = ({
  children,
  as: Tag = 'div',
  delay = 0,
  threshold = 0.2,
  direction = 'up',
  className = '',
  ...rest
}) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const directionClass = direction === 'left' ? ' scroll-reveal--left' : direction === 'fade' ? ' scroll-reveal--fade' : ''

  return (
    <Tag
      ref={ref}
      className={`scroll-reveal${directionClass}${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal
