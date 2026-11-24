import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEscape } from "@/hooks/useEscape";

export type OverlayPlacement = "bottom" | "center" | "top";

interface OverlayShellProps {
  open: boolean;
  onClose: () => void;
  placement: OverlayPlacement;
  /** id of the element that names the dialog. */
  labelledBy: string;
  children: ReactNode;
  /** Close when the dim backdrop is tapped. */
  dismissOnBackdrop?: boolean;
  panelClassName?: string;
}

const ALIGN: Record<OverlayPlacement, string> = {
  bottom: "items-end",
  center: "items-center px-4",
  top: "items-start",
};

const PANEL: Record<OverlayPlacement, string> = {
  bottom: "max-h-[90%] rounded-t-[2rem] border-t pb-safe",
  center: "max-h-[90%] rounded-[1.75rem] border",
  top: "max-h-[86%] rounded-b-[2rem] border-b pt-safe",
};

const OFFSET: Record<OverlayPlacement, number> = { bottom: 48, center: 18, top: -48 };

/** Dim backdrop plus a sliding panel, scoped to the phone frame. */
export function OverlayShell({
  open,
  onClose,
  placement,
  labelledBy,
  children,
  dismissOnBackdrop = true,
  panelClassName = "",
}: OverlayShellProps) {
  useEscape(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="absolute inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-canvas/75 backdrop-blur-[2px]"
            onClick={dismissOnBackdrop ? onClose : undefined}
          />
          <div className={`pointer-events-none absolute inset-0 flex justify-center ${ALIGN[placement]}`}>
            <Panel placement={placement} labelledBy={labelledBy} className={panelClassName}>
              {children}
            </Panel>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PanelProps {
  placement: OverlayPlacement;
  labelledBy: string;
  className: string;
  children: ReactNode;
}

function Panel({ placement, labelledBy, className, children }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.focus({ preventScroll: true });
    return () => {
      const active = document.activeElement;
      // Only hand focus back if it's still ours (another dialog may have taken it).
      if (!active || active === document.body || (node && node.contains(active))) {
        previous?.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      initial={{ y: OFFSET[placement], opacity: 0.6 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: OFFSET[placement], opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
      className={`pointer-events-auto w-full overflow-y-auto overscroll-contain border-foreground/[0.08] bg-card shadow-elegant focus:outline-none ${PANEL[placement]} ${className}`}
    >
      {children}
    </motion.div>
  );
}