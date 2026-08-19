import { api } from "./api";
import type { Category, Offer } from "../types";

type RawCategory = Record<string, unknown> & {
  _id?: string;
  id?: string;
  name?: string;
  imageUrl?: string;
  image?: { url?: string } | string;
  itemCount?: number;
};

type RawOffer = Record<string, unknown> & {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  image?: { url?: string } | string;
  code?: string;
  validUntil?: string;
};

function imageUrlFrom(raw: { imageUrl?: string; image?: { url?: string } | string }): string {
  if (raw.imageUrl) return String(raw.imageUrl);
  if (typeof raw.image === "string") return raw.image;
  return String(raw.image?.url ?? "");
}

export function mapCategory(raw: unknown): Category {
  const category = (raw ?? {}) as RawCategory;
  return {
    id: String(category.id ?? category._id ?? ""),
    name: String(category.name ?? ""),
    imageUrl: imageUrlFrom(category),
    itemCount: category.itemCount != null ? Number(category.itemCount) : undefined,
  };
}

export function mapOffer(raw: unknown): Offer {
  const offer = (raw ?? {}) as RawOffer;
  return {
    id: String(offer.id ?? offer._id ?? ""),
    title: String(offer.title ?? ""),
    description: String(offer.description ?? ""),
    imageUrl: imageUrlFrom(offer),
    code: offer.code ? String(offer.code) : undefined,
    validUntil: offer.validUntil ? String(offer.validUntil) : undefined,
  };
}

export const categoryService = {
  // Backend route is GET /categories/food (there is no GET /categories), and the
  // response body is `{ data: { categories } }`, not a bare array.
  list: () =>
    api
      .get<{ data: { categories: unknown[] } }>("/categories/food")
      .then((res) => (res.data.data.categories ?? []).map(mapCategory)),
};

export const offerService = {
  // Backend responds with `{ data: { offers } }`.
  list: () =>
    api
      .get<{ data: { offers: unknown[] } }>("/offers")
      .then((res) => (res.data.data.offers ?? []).map(mapOffer)),
};
