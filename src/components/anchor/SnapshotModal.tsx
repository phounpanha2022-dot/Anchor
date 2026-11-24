import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, ImagePlus, Package, Timer, X } from "lucide-react";
import { OverlayShell } from "./OverlayShell";
import { SAMPLE_BAG_IMAGE, SNAPSHOT_TTL_HOURS } from "@/lib/snapshot";

interface SnapshotModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (imageUrl: string, note: string) => void;
}

const DEFAULT_NOTE = "Brown pharmacy bag set on living room table";

/** Silent 1-tap "where did I set it down" photo, saved for Panic step 2. */
export function SnapshotModal({ open, onClose, onSave }: SnapshotModalProps) {
  return (
    <OverlayShell open={open} onClose={onClose} placement="bottom" labelledBy="snapshot-title">
      <SnapshotBody onClose={onClose} onSave={onSave} />
    </OverlayShell>
  );
}

function SnapshotBody({ onClose, onSave }: Omit<SnapshotModalProps, "open">) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadedRef = useRef<string | null>(null);
  const savedRef = useRef(false);

  // An uploaded photo we never saved is released when the modal closes.
  useEffect(
    () => () => {
      if (uploadedRef.current && !savedRef.current) URL.revokeObjectURL(uploadedRef.current);
    },
    []
  );

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't a photo. Try a JPG or PNG.");
      return;
    }
    if (uploadedRef.current) URL.revokeObjectURL(uploadedRef.current);
    const url = URL.createObjectURL(file);
    uploadedRef.current = url;
    setError(null);
    setImageUrl(url);
  };

  const useSample = () => {
    setError(null);
    setImageUrl(SAMPLE_BAG_IMAGE);
  };

  const save = () => {
    if (!imageUrl) return;
    savedRef.current = true;
    onSave(imageUrl, note.trim() || DEFAULT_NOTE);
  };

  return (
    <div className="px-5 pt-3 pb-4">
      <span aria-hidden className="mx-auto block h-1 w-10 rounded-full bg-foreground/15" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-calm">Welcome home</p>
          <h2 id="snapshot-title" className="mt-1 font-display text-2xl text-foreground">
            Snap where it landed
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            One quiet photo so future-you can find it. It deletes itself in {SNAPSHOT_TTL_HOURS} hours.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-foreground/[0.08] bg-background/60">
        {imageUrl ? (
          <img src={imageUrl} alt="Your arrival snapshot" width={1200} height={896} className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-calm/30 text-calm/80 transition-colors duration-150 hover:text-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Camera className="h-7 w-7" aria-hidden />
            <span className="text-sm font-semibold">Tap to take or upload a photo</span>
          </button>
        )}
        <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-[10px] font-bold text-calm">
          <Timer className="h-3 w-3" aria-hidden />
          {SNAPSHOT_TTL_HOURS}h auto-delete
        </span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" tabIndex={-1} aria-hidden />

      {error && (
        <p className="mt-2 text-xs font-semibold text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-foreground/[0.08] bg-background/50 text-sm font-bold text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          Upload photo
        </button>
        <button
          type="button"
          onClick={useSample}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-calm/25 bg-calm/10 text-sm font-bold text-calm transition-[background-color,transform] duration-150 ease-out hover:bg-calm/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <Package className="h-4 w-4" aria-hidden />
          Use Sample Pharmacy Bag
        </button>
      </div>

      <label htmlFor="snapshot-note" className="mt-4 block text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        One-line note
      </label>
      <input
        id="snapshot-note"
        type="text"
        value={note}
        maxLength={90}
        onChange={(event) => setNote(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-foreground/[0.08] bg-background/70 px-3.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
      />

      <button
        type="button"
        onClick={save}
        disabled={!imageUrl}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-40"
      >
        Save snapshot
      </button>
    </div>
  );
}