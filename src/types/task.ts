export type TaskCategory = "anchor" | "flow";

export type Chakra = "low" | "high";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  chakra: Chakra;
  minutes: number;
  autoVanishHours?: number;
}