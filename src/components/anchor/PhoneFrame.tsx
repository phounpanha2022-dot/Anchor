import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PhoneFrameProps {
  children: ReactNode;
  /** Owed to Me: glowing emerald border around the whole viewport. */
  perimeter?: boolean;
}

/**
 * Centered mobile viewport on desktop, full-screen on phones.
 */
export function PhoneFrame({ children, perimeter = false }: PhoneFrameProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-canvas bg-canvas-glow md:flex md:items-center md:justify-center md:py-6">
      <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-background md:h-[min(880px,calc(100dvh-3rem))] md:max-w-[400px] md:rounded-[2.75rem] md:border md:border-foreground/[0.08] md:shadow-elegant">
        {children}

        <AnimatePresence>
          {perimeter && (
            <motion.div
              key="perimeter"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="perimeter-owed pointer-events-none absolute inset-0 z-50 rounded-[inherit]"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}