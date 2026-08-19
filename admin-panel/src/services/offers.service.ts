import api, { unwrapEntity, unwrapPaginated } from './api';
import type { Offer, Paginated, QueryParams } from '@/types';

const mapOffer = (o: Record<string, unknown>): Offer => {
  const restaurant = o.restaurant as Record<string, unknown> | string | null | undefined;
  const food = o.food as Record<string, unknown> | string | null | undefined;
  const restaurantId =
    restaurant && typeof restaurant === 'object'
      ? String(restaurant.id ?? restaurant._id ?? '')
      : restaurant
        ? String(restaurant)
        : '';
  const foodId =
    food && typeof food === 'object' ? String(food.id ?? food._id ?? '') : food ? String(food) : '';

  let offerType: Offer['offerType'] = 'platform';
  if (foodId) offerType = 'item';
  else if (restaurantId) offerType = 'restaurant';

  return {
    id: String(o.id ?? o._id ?? ''),
    title: String(o.title ?? ''),
    description: o.description ? String(o.description) : undefined,
    image:
      typeof o.image === 'object' && o.image
        ? String((o.image as { url?: string }).url ?? '')
        : o.image
          ? String(o.image)
          : undefined,
    offerType,
    discountValue: Number(o.discountValue ?? o.value ?? 0),
    targetId: foodId || restaurantId || undefined,
    targetName:
      food && typeof food === 'object'
        ? String(food.name ?? '')
        : restaurant && typeof restaurant === 'object'
          ? String(restaurant.name ?? '')
          : undefined,
    isActive: o.isActive !== false,
    startDate: String(o.validFrom ?? o.startDate ?? ''),
    endDate: String(o.validUntil ?? o.endDate ?? ''),
    createdAt: String(o.createdAt ?? ''),
  };
};

const appendMappedOfferFields = (form: FormData, source: FormData | Partial<Offer>) => {
  if (source instanceof FormData) {
    source.forEach((value, key) => {
      if (key === 'startDate') form.append('validFrom', value);
      else if (key === 'endDate') form.append('validUntil', value);
      else if (key === 'offerType') {
        // handled via targetId below
      } else if (key === 'targetId') {
        const offerType = String(source.get('offerType') ?? 'platform');
        if (offerType === 'item' || offerType === 'category') form.append('food', value);
        else if (offerType === 'restaurant') form.append('restaurant', value);
      } else if (key === 'discountValue') {
        form.append('discountValue', value);
        if (!source.has('discountType')) form.append('discountType', 'percentage');
      } else {
        form.append(key, value);
      }
    });
    if (!form.has('discountType')) form.append('discountType', 'percentage');
    return form;
  }

  if (source.title != null) form.append('title', source.title);
  if (source.description != null) form.append('description', source.description);
  if (source.discountValue != null) form.append('discountValue', String(source.discountValue));
  form.append('discountType', 'percentage');
  if (source.startDate) form.append('validFrom', source.startDate);
  if (source.endDate) form.append('validUntil', source.endDate);
  if (source.isActive != null) form.append('isActive', String(source.isActive));
  if (source.targetId) {
    if (source.offerType === 'item' || source.offerType === 'category') {
      form.append('food', source.targetId);
    } else if (source.offerType === 'restaurant') {
      form.append('restaurant', source.targetId);
    }
  }
  return form;
};

export const offersService = {
  list: async (params: QueryParams = {}): Promise<Paginated<Offer>> => {
    const res = await api.get('/offers/admin/all', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res, 'offers');
    return { ...page, items: page.items.map(mapOffer) };
  },
  get: async (id: string): Promise<Offer> => {
    const list = await offersService.list();
    const found = list.items.find((item) => item.id === id);
    if (!found) throw new Error('Offer not found');
    return found;
  },
  create: async (payload: FormData | Partial<Offer>): Promise<Offer> => {
    const body =
      payload instanceof FormData ? appendMappedOfferFields(new FormData(), payload) : toJsonPayload(payload);
    const res = await api.post('/offers', body, {
      headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return mapOffer(unwrapEntity(res, 'offer'));
  },
  update: async (id: string, payload: FormData | Partial<Offer>): Promise<Offer> => {
    const body =
      payload instanceof FormData ? appendMappedOfferFields(new FormData(), payload) : toJsonPayload(payload);
    const res = await api.patch(`/offers/${id}`, body, {
      headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return mapOffer(unwrapEntity(res, 'offer'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/offers/${id}`);
  },
  toggleActive: async (id: string, isActive: boolean): Promise<Offer> => {
    const res = await api.patch(`/offers/${id}`, { isActive });
    return mapOffer(unwrapEntity(res, 'offer'));
  },
};

function toJsonPayload(payload: Partial<Offer>): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: payload.title,
    description: payload.description,
    discountType: 'percentage',
    discountValue: payload.discountValue,
    validFrom: payload.startDate,
    validUntil: payload.endDate,
    isActive: payload.isActive,
  };
  if (payload.targetId) {
    if (payload.offerType === 'item' || payload.offerType === 'category') body.food = payload.targetId;
    else if (payload.offerType === 'restaurant') body.restaurant = payload.targetId;
  }
  return body;
}
