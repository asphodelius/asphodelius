"use client"

import { useEffect, useRef } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const elementRef = useRef<HTMLSpanElement>(null)
  const annotationRef = useRef<RoughAnnotation | null>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useEffect(() => {
    const element = elementRef.current
    let resizeObserver: ResizeObserver | null = null
    let rafId: number | null = null

    const teardownAnnotation = () => {
      if (annotationRef.current) {
        annotationRef.current.remove()
        annotationRef.current = null
      }
    }

    const renderAnnotation = () => {
      if (!element || !shouldShow) {
        teardownAnnotation()
        return
      }

      teardownAnnotation()

      const annotation = annotate(element, {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      })

      annotationRef.current = annotation
      annotation.show()
    }

    if (shouldShow && element) {
      renderAnnotation()

      resizeObserver = new ResizeObserver(() => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }

        rafId = requestAnimationFrame(() => {
          renderAnnotation()
          rafId = null
        })
      })

      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current)
      }

      resizeObserver.observe(element)
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      teardownAnnotation()

      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ])

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block align-baseline bg-transparent"
    >
      <span ref={elementRef} className="inline-block bg-transparent">
        {children}
      </span>
    </span>
  )
}
