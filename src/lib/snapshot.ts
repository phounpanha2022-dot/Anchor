/** How long a snapshot survives before auto-deleting, in hours. */
export const SNAPSHOT_TTL_HOURS = 48;

/** Placeholder image URL used as a demo bag image. */
export const SAMPLE_BAG_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23735735'%3E%3Crect width='400' height='300' rx='12' fill='%23d2b48c'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23735735'%3ESample bag photo%3C/text%3E%3C/svg%3E";

export interface ArrivalSnapshot {
  imageUrl: string | null;
  note: string;
  when: string;
  takenAt: number | null;
}
