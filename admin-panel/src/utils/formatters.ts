export const formatCurrency = (value: number | undefined | null, currency = 'INR'): string => {
  const amount = value ?? 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

export const formatNumber = (value: number | undefined | null): string => {
  return new Intl.NumberFormat('en-IN').format(value ?? 0);
};

export const formatDate = (date: string | number | Date | undefined | null, withTime = false): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  const options: Intl.DateTimeFormatOptions = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-IN', options).format(d);
};

export const formatDateTime = (date: string | number | Date | undefined | null): string => formatDate(date, true);

export const formatRelativeTime = (date: string | number | Date | undefined | null): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(date);
};

export const formatPercent = (value: number | undefined | null): string => {
  const v = value ?? 0;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
};

export const titleCase = (value: string | undefined | null): string => {
  if (!value) return '';
  return value
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const getInitials = (name: string | undefined | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const truncate = (text: string | undefined | null, max = 60): string => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
};
