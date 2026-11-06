export const ALLOWED_MAPEL_NAMES = [
  "Matematika",
] as const;

export type AllowedMapelName = (typeof ALLOWED_MAPEL_NAMES)[number];

/**
 * Normalizes any raw subject name string into the single allowed canonical subject (Matematika).
 */
export function normalizeMapel(_name?: string | null): AllowedMapelName {
  return "Matematika";
}
