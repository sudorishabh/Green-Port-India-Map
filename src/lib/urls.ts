/**
 * Whether `value` is an absolute http(s) URL. Links rendered on the public map
 * must be, so `javascript:` and other schemes can't be stored. Shared by the
 * server and the portal forms.
 */
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
