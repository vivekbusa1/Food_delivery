import api, { unwrap } from './api';
import type { CmsPage, Paginated, QueryParams } from '@/types';

const mapPage = (page: Record<string, unknown>): CmsPage => {
  const value = (page.value || {}) as Record<string, unknown>;
  const key = String(page.key ?? '');
  const slug = String(value.slug ?? key.replace(/^cms_/, '') ?? '');
  return {
    id: String(page.id ?? slug),
    slug,
    title: String(value.title ?? slug),
    content: String(value.content ?? ''),
    isPublished: page.isPublic !== false,
    updatedAt: String(page.updatedAt ?? page.createdAt ?? ''),
  };
};

export const cmsService = {
  list: async (_params: QueryParams = {}): Promise<Paginated<CmsPage>> => {
    const res = await api.get('/admin/cms');
    const data = unwrap<{ pages?: Array<Record<string, unknown>> }>(res);
    const items = (data.pages ?? []).map(mapPage);
    return { items, total: items.length, page: 1, limit: items.length || 10, totalPages: 1 };
  },
  get: async (idOrSlug: string): Promise<CmsPage> => {
    const slug = idOrSlug.replace(/^cms_/, '');
    const res = await api.get(`/admin/cms/${slug}`);
    const data = unwrap<{ page?: Record<string, unknown> }>(res);
    return mapPage(data.page ?? { key: `cms_${slug}`, value: {} });
  },
  create: async (payload: Partial<CmsPage>): Promise<CmsPage> => {
    const slug = payload.slug || 'page';
    const res = await api.put(`/admin/cms/${slug}`, {
      title: payload.title,
      content: payload.content,
    });
    const data = unwrap<{ page?: Record<string, unknown> }>(res);
    return mapPage(data.page ?? { key: `cms_${slug}`, value: payload });
  },
  update: async (id: string, payload: Partial<CmsPage>): Promise<CmsPage> => {
    const slug = payload.slug || id.replace(/^cms_/, '');
    const res = await api.put(`/admin/cms/${slug}`, {
      title: payload.title,
      content: payload.content,
    });
    const data = unwrap<{ page?: Record<string, unknown> }>(res);
    return mapPage(data.page ?? { key: `cms_${slug}`, value: payload });
  },
  remove: async (_id: string): Promise<void> => {
    throw new Error('CMS page delete is not supported; clear content via edit instead');
  },
};
