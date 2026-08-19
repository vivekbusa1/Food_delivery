import api, { unwrap } from './api';
import type { LogEntry, Paginated, QueryParams } from '@/types';

export const logsService = {
  list: async (params: QueryParams = {}): Promise<Paginated<LogEntry>> => {
    const res = await api.get('/admin/logs', { params });
    const data = unwrap<{ logs?: Array<Record<string, unknown>> }>(res);
    const items = (data.logs ?? []).map((log, index) => ({
      id: String(log.id ?? index),
      actor: String(log.actor ?? log.user ?? 'system'),
      action: String(log.action ?? log.level ?? 'log'),
      entity: String(log.entity ?? log.service ?? 'app'),
      entityId: log.entityId ? String(log.entityId) : undefined,
      ip: log.ip ? String(log.ip) : undefined,
      level: String(log.level ?? 'info') as LogEntry['level'],
      message: String(log.message ?? JSON.stringify(log)),
      createdAt: String(log.timestamp ?? log.createdAt ?? new Date().toISOString()),
    }));

    const search = typeof params.search === 'string' ? params.search.toLowerCase() : '';
    const filtered = search
      ? items.filter((item) => item.message.toLowerCase().includes(search))
      : items;

    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      limit: filtered.length || 10,
      totalPages: 1,
    };
  },
};
