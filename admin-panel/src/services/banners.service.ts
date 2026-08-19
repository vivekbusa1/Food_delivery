import api, { unwrapEntity, unwrapPaginated } from './api';
import type { Banner, Paginated, QueryParams } from '@/types';

const LINK_TYPE_TO_BACKEND: Record<string, string> = {
  external: 'url',
  restaurant: 'restaurant',
  category: 'category',
  offer: 'offer',
  none: 'none',
  url: 'url',
  food: 'food',
};

const LINK_TYPE_FROM_BACKEND: Record<string, Banner['linkType']> = {
  url: 'external',
  external: 'external',
  restaurant: 'restaurant',
  category: 'category',
  offer: 'offer',
  none: 'none',
  food: 'category',
};

const POSITION_TO_BACKEND: Record<string, string> = {
  home_top: 'home_top',
  home_middle: 'home_middle',
  category: 'restaurant_page',
  checkout: 'home_bottom',
  home_bottom: 'home_bottom',
  restaurant_page: 'restaurant_page',
};

const POSITION_FROM_BACKEND: Record<string, Banner['position']> = {
  home_top: 'home_top',
  home_middle: 'home_middle',
  home_bottom: 'checkout',
  restaurant_page: 'category',
  category: 'category',
  checkout: 'checkout',
};

const mapBanner = (b: Record<string, unknown>): Banner => {
  const linkTypeRaw = String(b.linkType ?? 'none');
  const positionRaw = String(b.position ?? 'home_top');
  const linkValue =
    b.linkUrl != null && String(b.linkUrl)
      ? String(b.linkUrl)
      : b.linkId != null
        ? String(b.linkId)
        : b.linkValue
          ? String(b.linkValue)
          : undefined;

  return {
    id: String(b.id ?? b._id ?? ''),
    title: String(b.title ?? ''),
    image:
      typeof b.image === 'object' && b.image
        ? String((b.image as { url?: string }).url ?? '')
        : String(b.image ?? ''),
    linkType: LINK_TYPE_FROM_BACKEND[linkTypeRaw] ?? 'none',
    linkValue,
    position: POSITION_FROM_BACKEND[positionRaw] ?? 'home_top',
    isActive: b.isActive !== false,
    startDate: b.startDate ? String(b.startDate) : undefined,
    endDate: b.endDate ? String(b.endDate) : undefined,
    sortOrder: Number(b.order ?? b.sortOrder ?? 0),
    createdAt: String(b.createdAt ?? ''),
  };
};

const normalizeBannerFormData = (payload: FormData): FormData => {
  const form = new FormData();
  const linkType = String(payload.get('linkType') ?? 'none');
  const mappedLinkType = LINK_TYPE_TO_BACKEND[linkType] ?? 'none';
  const position = String(payload.get('position') ?? 'home_top');
  const mappedPosition = POSITION_TO_BACKEND[position] ?? 'home_top';
  const linkValue = payload.get('linkValue');

  payload.forEach((value, key) => {
    if (key === 'linkType') form.append('linkType', mappedLinkType);
    else if (key === 'position') form.append('position', mappedPosition);
    else if (key === 'linkValue') {
      // mapped below
    } else if (key === 'sortOrder') form.append('order', value);
    else form.append(key, value);
  });

  if (linkValue != null && String(linkValue)) {
    if (mappedLinkType === 'url') form.append('linkUrl', String(linkValue));
    else if (mappedLinkType !== 'none') form.append('linkId', String(linkValue));
  }

  if (!form.has('linkType')) form.append('linkType', mappedLinkType);
  if (!form.has('position')) form.append('position', mappedPosition);

  return form;
};

export const bannersService = {
  list: async (params: QueryParams = {}): Promise<Paginated<Banner>> => {
    const res = await api.get('/banners/admin/all', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res, 'banners');
    return { ...page, items: page.items.map(mapBanner) };
  },
  create: async (payload: FormData): Promise<Banner> => {
    const res = await api.post('/banners', normalizeBannerFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapBanner(unwrapEntity(res, 'banner'));
  },
  update: async (id: string, payload: FormData | Partial<Banner>): Promise<Banner> => {
    if (payload instanceof FormData) {
      const res = await api.patch(`/banners/${id}`, normalizeBannerFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return mapBanner(unwrapEntity(res, 'banner'));
    }

    const body: Record<string, unknown> = {
      title: payload.title,
      isActive: payload.isActive,
      startDate: payload.startDate,
      endDate: payload.endDate,
      order: payload.sortOrder,
    };
    if (payload.linkType != null) {
      body.linkType = LINK_TYPE_TO_BACKEND[payload.linkType] ?? 'none';
    }
    if (payload.position != null) {
      body.position = POSITION_TO_BACKEND[payload.position] ?? 'home_top';
    }
    if (payload.linkValue != null) {
      const lt = String(body.linkType ?? LINK_TYPE_TO_BACKEND[payload.linkType ?? 'none']);
      if (lt === 'url') body.linkUrl = payload.linkValue;
      else if (lt !== 'none') body.linkId = payload.linkValue;
    }

    const res = await api.patch(`/banners/${id}`, body);
    return mapBanner(unwrapEntity(res, 'banner'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/banners/${id}`);
  },
  toggleActive: async (id: string, isActive: boolean): Promise<Banner> => {
    const res = await api.patch(`/banners/${id}`, { isActive });
    return mapBanner(unwrapEntity(res, 'banner'));
  },
  reorder: async (_orderedIds: string[]): Promise<void> => {
    // Backend has no dedicated reorder endpoint; no-op.
  },
};
