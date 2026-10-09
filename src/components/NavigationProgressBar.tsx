'use client'

import { useEffect, useState, useRef, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activeUrlRef = useRef<string>('')

  const startProgress = () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    setIsVisible(true)
    setProgress(28)

    // Smooth progressive trickle
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + Math.random() * 15
        if (prev < 88) return prev + Math.random() * 6
        if (prev < 96) return prev + 1
        return prev
      })
    }, 180)
  }

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(100)

    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false)
      setProgress(0)
    }, 250)
  }

  // Complete progress whenever the route changes
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams.toString()}`
    if (activeUrlRef.current && activeUrlRef.current !== currentUrl) {
      completeProgress()
    }
    activeUrlRef.current = currentUrl
  }, [pathname, searchParams])

  // Global click interceptor for internal navigation links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external links, mailto, tel, hash-only anchors, target="_blank", and modified clicks
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.target === '_blank' ||
        target.hasAttribute('download') ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      // Check if clicking current URL
      const currentPath = window.location.pathname + window.location.search
      if (href === currentPath) return

      // Trigger instant progress
      startTransition(() => {
        startProgress()
      })
    }

    // Custom events for server actions or buttons
    const handleCustomStart = () => startProgress()
    const handleCustomComplete = () => completeProgress()

    window.addEventListener('click', handleClick, { capture: true })
    window.addEventListener('app:loading-start', handleCustomStart)
    window.addEventListener('app:loading-end', handleCustomComplete)

    return () => {
      window.removeEventListener('click', handleClick, { capture: true })
      window.removeEventListener('app:loading-start', handleCustomStart)
      window.removeEventListener('app:loading-end', handleCustomComplete)
      if (timerRef.current) clearInterval(timerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  if (!isVisible && progress === 0) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Top glowing progress bar */}
      <div
        className="h-[2.5px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.9),0_0_5px_rgba(59,130,246,0.7)] transition-all duration-200 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Glowing comet head */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-2 bg-gradient-to-l from-white via-cyan-300 to-transparent blur-[2px] opacity-90" />
      </div>

      {/* Subtle top right spinner indicator for longer loads */}
      {progress > 50 && isVisible && (
        <div className="fixed top-3 right-4 z-[99999] pointer-events-none">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        </div>
      )}
    </div>
  )
}
