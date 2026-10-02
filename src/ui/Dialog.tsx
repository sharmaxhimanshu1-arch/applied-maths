import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  /** 'center' modal or 'side' sheet sliding from the right (bottom on phones). */
  variant?: 'center' | 'side'
  hideTitle?: boolean
}

/** Modal built on the native <dialog> element: focus trapping, Escape and top-layer for free. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  variant = 'center',
  hideTitle,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // React's autoFocus runs before the dialog opens, so focus the marked element here.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onPointerDown={(e) => {
        // Click on the backdrop (the dialog element itself, outside the panel) closes it.
        if (e.target === ref.current) onClose()
      }}
      className={cn(
        'fixed m-0 max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-black/40 backdrop:backdrop-blur-[2px]',
        variant === 'center'
          ? 'inset-0 m-auto h-fit w-[min(40rem,calc(100vw-2rem))]'
          : 'inset-y-0 right-0 left-auto h-dvh w-[min(28rem,100vw)] max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-[85dvh] max-sm:w-full',
      )}
    >
      {open && (
        <div
          className={cn(
            'flex max-h-[inherit] flex-col overflow-hidden border border-line bg-surface shadow-lg',
            variant === 'center'
              ? 'max-h-[85dvh] rounded-2xl'
              : 'h-full rounded-l-2xl max-sm:rounded-t-2xl max-sm:rounded-bl-none',
            className,
          )}
        >
          <div className={cn('flex items-start gap-3 px-5 pt-4', hideTitle ? 'pb-0' : 'pb-3')}>
            <div className={cn('min-w-0 flex-1', hideTitle && 'sr-only')}>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
            </div>
            <IconButton label="Close" size="sm" onClick={onClose} className="-mr-1 ml-auto">
              <X className="size-4.5" />
            </IconButton>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}
