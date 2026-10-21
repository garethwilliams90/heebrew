"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { motion } from "motion/react"
import { Slot } from "radix-ui"
import { usePlaySample, type SampleName } from "@/components/settings/settings-provider"

const buttonHover = {
  scale: 1.04,
  transition: { type: "spring" as const, bounce: 0.2, visualDuration: 0.2 },
}

const buttonTap = {
  scale: 0.96,
  transition: { type: "spring" as const, bounce: 0.05, visualDuration: 0.12 },
}

const buttonTransition = {
  type: "spring" as const,
  bounce: 0.18,
  visualDuration: 0.2,
}

const buttonVariants = cva(
  "group/button relative cursor-pointer inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = Omit<
  React.ComponentProps<"button">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    sound?: SampleName | false
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  sound = "switchOn",
  onClick,
  ...rest
}: ButtonProps) {
  const playSample = usePlaySample()
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (sound) {
        playSample(sound)
      }
      onClick?.(event)
    },
  }
  const shared = {
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
    className: cn(buttonVariants({ variant, size, className })),
    whileHover: buttonHover,
    whileTap: buttonTap,
    transition: buttonTransition,
  }

  if (asChild) {
    const { children, ...slotProps } = props
    // Slot rejects whitespace, promises, and anything that is not one element.
    // A server-rendered link often arrives in one of those shapes.
    return (
      <motion.span
        className="inline-flex shrink-0"
        whileHover={buttonHover}
        whileTap={buttonTap}
        transition={buttonTransition}
        // whileTap would otherwise turn this wrapper into a tab stop
        tabIndex={-1}
      >
        <Slot.Root
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(buttonVariants({ variant, size, className }))}
          {...slotProps}
        >
          {slotChild(children)}
        </Slot.Root>
      </motion.span>
    )
  }

  return <motion.button {...shared} {...props} />
}

function slotChild(children: React.ReactNode): React.ReactNode {
  let current: unknown = children
  if (isThenable(current)) {
    current = React.use(current)
  }
  if (isLazyNode(current)) {
    current = React.use(current._payload)
  }

  const node = current as React.ReactNode
  if (React.Children.count(node) === 1 && React.isValidElement(node)) {
    return node
  }

  const nodes = React.Children.toArray(node).filter((child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child).trim().length > 0
    }
    return React.isValidElement(child)
  })
  return nodes.length === 1 ? nodes[0] : node
}

function isThenable(value: unknown): value is Promise<unknown> {
  return typeof value === "object" && value !== null && typeof (value as { then?: unknown }).then === "function"
}

function isLazyNode(value: unknown): value is { _payload: Promise<unknown> } {
  if (typeof value !== "object" || value === null || !("$$typeof" in value) || !("_payload" in value)) {
    return false
  }
  return (value as { $$typeof?: symbol }).$$typeof === Symbol.for("react.lazy") && isThenable(value._payload)
}

export { Button, buttonVariants }
