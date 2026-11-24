import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MoonStar } from "lucide-react";
import { useEscape } from "@/hooks/useEscape";

interface DoomscrollInterceptProps {
  onGoodnight: () => void;
}

/** 2:00 AM: a calm, dim full-screen nudge to put the phone down. */
export function DoomscrollIntercept({ onGoodnight }: DoomscrollInterceptProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEscape(true, onGoodnight);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doomscroll-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="bg-night-dim absolute inset-0 z-[60] flex flex-col items-center justify-center px-8 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center"
      >
        <span className="grid h-16 w-16 place-items-center rounded-full border border-calm/20 bg-calm/[0.08] text-calm/80">
          <MoonStar className="h-7 w-7" aria-hidden />
        </span>
        <h2 id="doomscroll-title" className="mt-6 font-display text-5xl tabular-nums text-foreground/70">
          2:00 AM
        </h2>
        <p className="mt-5 max-w-[290px] text-lg leading-relaxed text-foreground/65">
          It's 2:00 AM. You're not behind—claim 15 mins of guilt-free rest tomorrow and put the phone down.
        </p>
        <button
          ref={buttonRef}
          type="button"
          onClick={onGoodnight}
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full border border-calm/25 bg-calm/10 px-8 text-[15px] font-bold text-calm/90 transition-[background-color,transform] duration-150 ease-out hover:bg-calm/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm active:scale-[0.97]"
        >
          Goodnight
        </button>
      </motion.div>
    </motion.div>
  );
}