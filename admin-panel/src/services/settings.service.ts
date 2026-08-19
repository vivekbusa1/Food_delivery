import api, { unwrap } from './api';
import type { AppSettings } from '@/types';

const DEFAULTS: AppSettings = {
  siteName: 'Food Delivery',
  supportEmail: '',
  supportPhone: '',
  currency: 'INR',
  deliveryRadiusKm: 10,
  defaultCommissionRate: 15,
  minOrderValue: 0,
  taxPercent: 0,
  maintenanceMode: false,
};

const settingsArrayToObject = (settings: Array<Record<string, unknown>>): AppSettings => {
  const mapped: AppSettings = { ...DEFAULTS };
  settings.forEach((row) => {
    const key = String(row.key ?? '');
    if (!key) return;
    mapped[key] = row.value as AppSettings[string];
  });
  return mapped;
};

export const settingsService = {
  get: async (): Promise<AppSettings> => {
    const res = await api.get('/settings');
    const data = unwrap<{ settings?: Array<Record<string, unknown>> }>(res);
    if (Array.isArray(data.settings)) return settingsArrayToObject(data.settings);
    if (data && typeof data === 'object') return { ...DEFAULTS, ...(data as AppSettings) };
    return { ...DEFAULTS };
  },
  update: async (payload: Partial<AppSettings>): Promise<AppSettings> => {
    const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
    await Promise.all(
      entries.map(([key, value]) =>
        api.put('/settings', {
          key,
          value,
          group: 'general',
          isPublic: ['siteName', 'supportEmail', 'supportPhone', 'currency'].includes(key),
        })
      )
    );
    return settingsService.get();
  },
};
