import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatCurrency(amount: number, currency = "$"): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${currency}${safeAmount.toFixed(2)}`;
}

export function formatDate(isoDate: string, pattern = "MMM d, yyyy"): string {
  try {
    return format(parseISO(isoDate), pattern);
  } catch {
    return isoDate;
  }
}

export function formatDateTime(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "MMM d, yyyy h:mm a");
  } catch {
    return isoDate;
  }
}

export function formatRelativeTime(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return isoDate;
  }
}

export function formatDistance(km?: number): string {
  if (km === undefined || km === null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatOrderStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
