"use client"

import { animate, frame, motion, useSpring } from "motion/react"
import { hover } from "motion"
import { useEffect, useRef } from "react"

const softLight =
  "radial-gradient(circle, color-mix(in oklch, var(--chart-1) 20%, transparent) 0%, color-mix(in oklch, var(--chart-1) 10%, transparent) 40%, transparent 72%)"

const rippleFill =
  "radial-gradient(circle, color-mix(in oklch, var(--chart-1)50%, transparent) 0%, color-mix(in oklch, var(--chart-1) 24%, transparent) 46%, transparent 74%)"

const softWash = "color-mix(in oklch, var(--chart-1) 16%, transparent)"

const brightBorder =
  "inset 0 0 0 1px color-mix(in oklch, var(--chart-1) 60%, white), inset 0 0 6px color-mix(in oklch, var(--chart-1) 40%, transparent)"

const followSpring = { bounce: 0, visualDuration: 0.20 }

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function pointInCard(card: HTMLElement, clientX: number, clientY: number) {
  const rect = card.getBoundingClientRect()
  return {
    x: clientX - rect.left - card.clientLeft,
    y: clientY - rect.top - card.clientTop,
  }
}

function spawnRipple(
  card: HTMLElement,
  host: HTMLElement,
  clientX: number,
  clientY: number
) {
  const blob = document.createElement("span")
  blob.className = "pointer-events-none absolute"
  blob.style.opacity = "0"

  if (prefersReducedMotion()) {
    blob.style.inset = "0"
    blob.style.background = "color-mix(in oklch, var(--chart-1) 30%, transparent)"
    host.appendChild(blob)
    const animation = animate(
      blob,
      { opacity: [0, 1, 0] },
      { duration: 0.70, ease: "easeOut", times: [0, 0.7, 1] }
    )
    animation.finished.then(() => blob.remove(), () => blob.remove())
    return
  }

  const point = pointInCard(card, clientX, clientY)
  const reach = Math.hypot(
    Math.max(point.x, card.clientWidth - point.x),
    Math.max(point.y, card.clientHeight - point.y)
  )
  // The gradient fades before the circle's edge, so the circle has to
  // overshoot the farthest corner for the wash to cross the whole card.
  const diameter = Math.max(reach * 2.8, 1)

  blob.classList.add("rounded-full")
  blob.style.left = `${point.x - diameter / 2}px`
  blob.style.top = `${point.y - diameter / 2}px`
  blob.style.width = `${diameter}px`
  blob.style.height = `${diameter}px`
  blob.style.background = rippleFill
  blob.style.transform = "scale(0)"
  host.appendChild(blob)

  const animation = animate(
    blob,
    {
      transform: ["scale(0)", "scale(1)"],
      opacity: [0, 0.9, 0],
    },
    {
      transform: { duration: 0.85, ease: [0.16, 0.7, 0.2, 1] },
      opacity: { duration: 0.85, ease: "easeOut", times: [0, 0.4, 1] },
    }
  )
  animation.finished.then(() => blob.remove(), () => blob.remove())
}

function CardRipple() {
  const layerRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const washRef = useRef<HTMLSpanElement>(null)
  const ripplesRef = useRef<HTMLSpanElement>(null)
  const borderRef = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, followSpring)
  const y = useSpring(0, followSpring)

  useEffect(() => {
    const card = layerRef.current?.parentElement
    const glow = glowRef.current
    const wash = washRef.current
    const ripples = ripplesRef.current
    const border = borderRef.current
    if (!card || !glow || !wash || !ripples || !border) return

    let borderAnimation: { stop: () => void } | null = null
    let hovering = false

    const moveTo = (clientX: number, clientY: number, jump: boolean) => {
      frame.read(() => {
        const rect = card.getBoundingClientRect()
        const nextX = clientX - rect.left - card.clientLeft
        const nextY = clientY - rect.top - card.clientTop
        if (jump) {
          x.jump(nextX)
          y.jump(nextY)
          return
        }
        x.set(nextX)
        y.set(nextY)
      })
    }

    const onMove = (event: PointerEvent) => {
      moveTo(event.clientX, event.clientY, false)
    }

    const stopHover = hover(card, (_element, event) => {
      hovering = true
      const fadeTarget = prefersReducedMotion() ? wash : glow

      if (!prefersReducedMotion()) {
        glow.style.willChange = "transform"
        moveTo(event.clientX, event.clientY, true)
        card.addEventListener("pointermove", onMove)
      }

      const fadeIn = animate(
        fadeTarget,
        { opacity: 1 },
        { duration: 0.20, ease: "easeOut" }
      )

      return () => {
        hovering = false
        card.removeEventListener("pointermove", onMove)
        fadeIn.stop()
        const fadeOut = animate(
          fadeTarget,
          { opacity: 0 },
          { duration: 0.25, ease: "easeOut" }
        )
        fadeOut.finished.then(() => {
          if (!hovering) glow.style.willChange = "auto"
        }, () => {})
      }
    })

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      spawnRipple(card, ripples, event.clientX, event.clientY)
      borderAnimation?.stop()
      borderAnimation = animate(
        border,
        { opacity: [0, 1, 1, 0] },
        { duration: 0.95, ease: "easeInOut", times: [0, 0.12, 0.68, 1] }
      )
    }

    card.addEventListener("pointerdown", onPointerDown)

    return () => {
      stopHover()
      card.removeEventListener("pointerdown", onPointerDown)
      card.removeEventListener("pointermove", onMove)
      borderAnimation?.stop()
    }
  }, [x, y])

  return (
    <span
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <motion.span
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 size-80 rounded-full opacity-0"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          background: softLight,
        }}
      />
      <span
        ref={washRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: softWash }}
      />
      <span ref={ripplesRef} className="pointer-events-none absolute inset-0" />
      <span
        ref={borderRef}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
        style={{ boxShadow: brightBorder }}
      />
    </span>
  )
}

export { CardRipple }
