import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatCurrency(value: number | undefined | null): string {
  const amount = value ?? 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | undefined | null): string {
  return new Intl.NumberFormat('en-IN').format(value ?? 0);
}

export function formatDate(date: string | Date | undefined | null, fmt = 'DD MMM YYYY'): string {
  if (!date) return '-';
  return dayjs(date).format(fmt);
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
}

export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).format('hh:mm A');
}

export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return dayjs(date).fromNow();
}

export function formatPercent(value: number | undefined | null): string {
  const v = value ?? 0;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

export function resolveAssetUrl(path: string | null | undefined, assetBaseUrl: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  return `${assetBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}
