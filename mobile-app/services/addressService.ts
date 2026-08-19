import { api } from "./api";
import { pickId, unwrapCollection, unwrapData } from "../utils/apiHelpers";
import type { Address } from "../types";

export type AddressPayload = Omit<Address, "id">;

type RawAddress = Record<string, unknown> & {
  _id?: string;
  id?: string;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  postalCode?: string;
  isDefault?: boolean;
  landmark?: string;
  instructions?: string;
  location?: { coordinates?: [number, number] };
  latitude?: number;
  longitude?: number;
};

function normalizeLabel(label: unknown): string {
  const value = String(label ?? "Home");
  if (!value) return "Home";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function mapAddress(raw: unknown): Address {
  const address = (raw ?? {}) as RawAddress;
  const coords = address.location?.coordinates;
  const longitude =
    address.longitude != null
      ? Number(address.longitude)
      : Array.isArray(coords)
        ? Number(coords[0] ?? 0)
        : 0;
  const latitude =
    address.latitude != null
      ? Number(address.latitude)
      : Array.isArray(coords)
        ? Number(coords[1] ?? 0)
        : 0;

  return {
    id: pickId(address),
    label: normalizeLabel(address.label),
    addressLine1: String(address.addressLine1 ?? ""),
    addressLine2: address.addressLine2 ? String(address.addressLine2) : undefined,
    city: String(address.city ?? ""),
    state: String(address.state ?? ""),
    postalCode: String(address.postalCode ?? address.zipCode ?? ""),
    country: String(address.country ?? "India"),
    latitude,
    longitude,
    isDefault: Boolean(address.isDefault),
    instructions: address.instructions
      ? String(address.instructions)
      : address.landmark
        ? String(address.landmark)
        : undefined,
  };
}

/** Convert app address fields into the backend create/update body. */
export function toBackendAddress(payload: Partial<AddressPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.label != null) body.label = String(payload.label).toLowerCase();
  if (payload.addressLine1 != null) body.addressLine1 = payload.addressLine1;
  if (payload.addressLine2 != null) body.addressLine2 = payload.addressLine2;
  if (payload.city != null) body.city = payload.city;
  if (payload.state != null) body.state = payload.state;
  if (payload.country != null) body.country = payload.country;
  if (payload.postalCode != null) body.zipCode = payload.postalCode;
  if (payload.isDefault != null) body.isDefault = payload.isDefault;
  if (payload.instructions != null) body.landmark = payload.instructions;
  if (payload.latitude != null || payload.longitude != null) {
    body.location = {
      type: "Point",
      coordinates: [Number(payload.longitude ?? 0), Number(payload.latitude ?? 0)],
    };
  }
  return body;
}

function unwrapAddress(body: unknown): Address {
  const data = unwrapData<{ address?: unknown } | unknown>(body);
  if (data && typeof data === "object" && "address" in (data as object)) {
    return mapAddress((data as { address: unknown }).address);
  }
  return mapAddress(data);
}

export const addressService = {
  list: () =>
    api.get("/addresses").then((res) => unwrapCollection(res.data, "addresses").map(mapAddress)),

  detail: (id: string) => api.get(`/addresses/${id}`).then((res) => unwrapAddress(res.data)),

  create: (payload: AddressPayload) =>
    api.post("/addresses", toBackendAddress(payload)).then((res) => unwrapAddress(res.data)),

  update: (id: string, payload: Partial<AddressPayload>) =>
    api.patch(`/addresses/${id}`, toBackendAddress(payload)).then((res) => unwrapAddress(res.data)),

  remove: (id: string) => api.delete(`/addresses/${id}`).then((res) => unwrapData(res.data)),

  // Backend route is PATCH /addresses/:id/default, not POST.
  setDefault: (id: string) =>
    api.patch(`/addresses/${id}/default`).then((res) => unwrapAddress(res.data)),

  reverseGeocode: (latitude: number, longitude: number) =>
    api
      .get("/addresses/reverse-geocode", { params: { latitude, longitude } })
      .then((res) => {
        const data = unwrapData<Partial<Address> | { address?: unknown }>(res.data);
        if (data && typeof data === "object" && "address" in data) {
          return mapAddress((data as { address: unknown }).address);
        }
        return mapAddress(data);
      })
      .catch(() => ({}) as Partial<Address>),
};
