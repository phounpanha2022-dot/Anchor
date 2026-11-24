/**
 * rantToTasks: turns a messy rant into one calm validation line and 3–4
 * bite-sized cards. Runs entirely on the device with keyword rules, so there
 * is no network call, no API key, and the raw text is never stored.
 */

export type RantCategory = "anchor" | "flow";
export type RantChakra = "low" | "high";

export interface RantTask {
  id: string;
  title: string;
  category: RantCategory;
  chakra: RantChakra;
  minutes: number;
}

export interface RantTriage {
  validationLine: string;
  tasks: RantTask[];
}

export const SAMPLE_RANTS: readonly string[] = [
  "I have a client deadline at 5, my room is a mess, and I'm exhausted.",
  "I forgot my meds, need to pay a bill, and can't start.",
];

type ThemeId = "deadline" | "meds" | "bill" | "call" | "mess" | "tired" | "stuck" | "inbox" | "food" | "move";

type Draft = Omit<RantTask, "id">;

interface Theme {
  id: ThemeId;
  pattern: RegExp;
  build: (text: string) => Draft;
}

const MAX_TASKS = 4;
const MIN_TASKS = 3;

function dueTime(text: string): string | null {
  const match = text.match(/\b(?:at|by|before|until)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) return null;
  const [, hour, minute, meridiem] = match;
  return `${hour}${minute ? `:${minute}` : ""}${meridiem ? ` ${meridiem.toUpperCase()}` : ""}`;
}

function deadlineSubject(text: string): string {
  if (/\bclient\b/i.test(text)) return "client project";
  if (/\breport\b/i.test(text)) return "report";
  if (/\bpresentation\b/i.test(text)) return "presentation";
  if (/\b(essay|assignment|homework)\b/i.test(text)) return "assignment";
  if (/\bproposal\b/i.test(text)) return "proposal";
  return "deadline";
}

const THEMES: Theme[] = [
  {
    id: "deadline",
    pattern: /\b(deadline|due|client|project|report|draft|submit|presentation|assignment|essay|proposal|homework)\b/i,
    build: (text) => {
      const time = dueTime(text);
      return {
        title: `10-min first pass on the ${deadlineSubject(text)}${time ? ` — due at ${time}` : ""}`,
        category: "anchor",
        chakra: "high",
        minutes: 10,
      };
    },
  },
  {
    id: "meds",
    pattern: /\b(meds?|medication|medicine|pills?|prescription|dose)\b/i,
    build: () => ({ title: "Take your meds with a full glass of water", category: "anchor", chakra: "low", minutes: 2 }),
  },
  {
    id: "bill",
    pattern: /\b(bills?|pay|payment|rent|invoice|taxes|insurance)\b/i,
    build: (text) => ({
      title: /\brent\b/i.test(text) ? "Pay rent — just open the app first" : "Pay the bill — just open the app first",
      category: "anchor",
      chakra: "low",
      minutes: 5,
    }),
  },
  {
    id: "call",
    pattern: /\b(call|phone|appointment|doctor|dentist|schedule)\b/i,
    build: () => ({
      title: "Make one call — write your first line before dialing",
      category: "anchor",
      chakra: "low",
      minutes: 5,
    }),
  },
  {
    id: "mess",
    pattern: /\b(mess|messy|clean|cleaning|laundry|dishes|room|desk|clutter|tidy|trash)\b/i,
    build: (text) => {
      if (/\blaundry\b/i.test(text)) return { title: "Start one load of laundry", category: "flow", chakra: "low", minutes: 5 };
      if (/\bdishes\b/i.test(text)) return { title: "Wash five dishes, then stop", category: "flow", chakra: "low", minutes: 5 };
      return { title: "Clear one surface for 5 minutes", category: "flow", chakra: "low", minutes: 5 };
    },
  },
  {
    id: "tired",
    pattern: /\b(exhausted|tired|drained|burn(?:ed|t)? out|no energy|sleepy|wiped)\b/i,
    build: () => ({
      title: "Drink water and sit somewhere soft for 3 minutes",
      category: "flow",
      chakra: "low",
      minutes: 3,
    }),
  },
  {
    id: "stuck",
    pattern: /(can'?t start|cannot start|\bstuck\b|procrastinat|\bfrozen\b|paralyz|overwhelm|too much)/i,
    build: () => ({ title: "Pick the smallest card and give it 2 minutes", category: "flow", chakra: "low", minutes: 2 }),
  },
  {
    id: "inbox",
    pattern: /\b(emails?|inbox|reply|replies|messages?|texts?|slack)\b/i,
    build: () => ({ title: "Reply to one message — just one", category: "flow", chakra: "low", minutes: 5 }),
  },
  {
    id: "food",
    pattern: /\b(hungry|eat|eating|food|groceries|grocery|lunch|dinner|breakfast)\b/i,
    build: (text) =>
      /\bgrocer/i.test(text)
        ? { title: "Write a 5-item grocery list", category: "flow", chakra: "low", minutes: 5 }
        : { title: "Eat something with protein", category: "flow", chakra: "low", minutes: 10 },
  },
  {
    id: "move",
    pattern: /\b(gym|workout|exercise|walk|run|stretch)\b/i,
    build: () => ({ title: "Step outside for a 10-minute walk", category: "flow", chakra: "high", minutes: 10 }),
  },
];

const FALLBACKS: Array<{ key: string; draft: Draft }> = [
  { key: "first-due", draft: { title: "Write down the one thing due soonest", category: "anchor", chakra: "low", minutes: 2 } },
  { key: "breathe", draft: { title: "Three slow breaths, eyes closed", category: "flow", chakra: "low", minutes: 1 } },
  { key: "water", draft: { title: "Drink a full glass of water", category: "flow", chakra: "low", minutes: 1 } },
];

function validationFor(found: Set<ThemeId>): string {
  const has = (id: ThemeId) => found.has(id);
  if (has("tired") && (has("deadline") || has("mess"))) {
    return "Running on empty with that much on your plate is genuinely hard — you're not lazy, you're out of fuel.";
  }
  if (has("deadline") && has("mess")) {
    return "A real deadline plus a messy space is a lot at once. We'll aim at the thing that's actually due.";
  }
  if (has("meds") && has("stuck")) {
    return "Missing your meds makes starting harder — that's chemistry, not weakness. We'll begin with the easiest step.";
  }
  if (has("stuck")) return "Not being able to start is how your brain works, not a character flaw. Let's make step one tiny.";
  if (has("tired")) return "Being this tired is a signal, not a failure. Every step here stays small.";
  if (has("deadline")) return "Deadlines get loud fast. You only need the first ten minutes, not the whole thing.";
  if (has("meds")) return "Forgetting happens to everyone. Let's fix the easy part first.";
  if (has("bill")) return "Money tasks feel heavier than they are. Opening the app is enough to begin.";
  if (has("mess")) return "A messy space isn't a verdict on you. One surface is enough.";
  return "That's a real pile, and naming it is the hardest part. Here's a gentle place to begin.";
}

/** Anchors lead; within each track, keep the order things came up in the rant. */
function rank(draft: Draft): number {
  return draft.category === "anchor" ? 0 : 1;
}

export function rantToTasks(rant: string): RantTriage {
  const text = rant.replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, " ").trim();

  const hits = THEMES.map((theme) => ({ theme, at: text.search(theme.pattern) }))
    .filter((hit) => hit.at >= 0)
    .sort((a, b) => a.at - b.at);
  const found = new Set<ThemeId>(hits.map((hit) => hit.theme.id));

  const drafts = hits
    .map((hit) => ({ key: hit.theme.id as string, draft: hit.theme.build(text) }))
    .sort((a, b) => rank(a.draft) - rank(b.draft));

  const picked = drafts.slice(0, MAX_TASKS);
  for (const fallback of FALLBACKS) {
    if (picked.length >= MIN_TASKS) break;
    if (fallback.key === "water" && found.has("tired")) continue;
    if (fallback.key === "first-due" && found.has("deadline")) continue;
    picked.push(fallback);
  }

  const stamp = Date.now().toString(36);
  return {
    validationLine: validationFor(found),
    tasks: picked.map(({ key, draft }, index) => ({ id: `rant-${stamp}-${index}-${key}`, ...draft })),
  };
}