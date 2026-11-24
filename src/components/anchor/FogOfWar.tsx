import { EyeOff } from "lucide-react";

const GHOSTS = ["w-14", "w-20", "w-10", "w-16", "w-12"];

/** Tomorrow's cards stay blurred shapes — nothing to read, nothing to dread. */
export function FogOfWar() {
  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl border border-dashed border-foreground/10 px-4 py-3.5">
      <div
        aria-hidden
        className="fog-mask pointer-events-none absolute inset-0 flex items-center justify-center gap-2 opacity-70 blur-[4px]"
      >
        {GHOSTS.map((width, i) => (
          <span key={i} className={`h-3 ${width} rounded-full bg-foreground/15`} />
        ))}
      </div>
      <p className="relative flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
        <EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold text-foreground/80">Fog of War:</span> Tomorrow is hidden until it arrives.
        </span>
      </p>
    </div>
  );
}