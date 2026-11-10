/** All dates and times are shown in India Standard Time: the app serves users in India. */
const TZ = "Asia/Kolkata";

const dateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateTime(iso: string | null): string {
  if (!iso) return "Time not set yet";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Time not set yet" : `${dateTime.format(d)} IST`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateOnly.format(d);
}
