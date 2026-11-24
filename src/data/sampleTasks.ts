import type { Task } from "@/types/task";

export const SAMPLE_TASKS: Task[] = [
  {
    id: "anchor-client-draft",
    title: "Submit client draft by 5 PM",
    category: "anchor",
    chakra: "high",
    minutes: 40,
  },
  {
    id: "anchor-electric-bill",
    title: "Pay electric bill",
    category: "anchor",
    chakra: "low",
    minutes: 5,
  },
  {
    id: "flow-meds-water",
    title: "Take morning meds + drink water",
    category: "flow",
    chakra: "low",
    minutes: 2,
    autoVanishHours: 24,
  },
  {
    id: "flow-clear-desk",
    title: "Clear desk surface",
    category: "flow",
    chakra: "high",
    minutes: 15,
    autoVanishHours: 24,
  },
];