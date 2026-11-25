# ANCHOR

A mobile-first, dark-HUD personal operating system built for ADHD and burned-out minds. Designed to cut through decision paralysis with single-card focus, tactile friction controls, and low-stimulation state feedback.

## Core Features

* **Obsidian Dark HUD (`#0B0D12`) & Single-Card Deck:** Instagram Story-style card navigation paired with a Dual-Track task system (**Hard Anchors** vs. **24h Ephemeral Flow** tasks) and a Fog of War footer.
* **Hybrid 4-Way Tactile Orb:** Functions as a flat 4-button tap nav bar at rest; transitions into a free 2D drag with a `+` crosshair layout and 35px magnetic lock-on/merge on drag.
* **Modular `<PixelTotem/>` States:** Visual state slots for `low`, `locked`, `owed`, and `panic`.
* **Friction & Recovery Mechanics:**
  * **"Owed to Me" 5-Second Reality Check:** Grants an emerald border on the first claim; enforces a 5-second hold-to-confirm friction modal on 2nd+ claims while Hard Anchors remain.
  * **Panic 5→1 Reverse Rewind:** Grounding overlay for acute overwhelm.
* **Hold-to-Rant Coach (`src/services/rantToTasks.ts`):** Converts brain dumps into actionable cards via local keyword triage with one-tap `+ Add` to deck.
* **Sensor Simulator Drawer:** 5 iOS-style triggers for testing context-aware flows (*Leaving Home*, *Leaving Cafe*, *Arriving Home* photo-to-Panic Step 2, *Over-Press Free Time*, and *2:00 AM Doomscroll Intercept*).

## Tech Stack

* **Framework:** React + TypeScript + Vite
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), `clsx`, `tailwind-merge`
* **Motion & Icons:** Framer Motion, Lucide React
* **Linting:** Oxlint

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check and build for production
npm run build
```

## Roadmap

* [ ] Replace placeholder `<PixelTotem/>` SVGs with custom Jump Super Stars-style pixel PNG sprites (`low`, `locked`, `owed`, `panic`).
* [ ] Upgrade `src/services/rantToTasks.ts` from local keyword triage to a live LLM API with strict JSON schema output.