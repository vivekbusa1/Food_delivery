import api, { unwrap, unwrapEntity, unwrapPaginated } from './api';
import type { Customer, Order, Paginated, QueryParams, StaffUser } from '@/types';

const mapCustomer = (user: Record<string, unknown>): Customer => ({
  id: String(user.id ?? ''),
  name: String(user.name ?? ''),
  email: String(user.email ?? ''),
  phone: String(user.phone ?? ''),
  avatar:
    typeof user.avatar === 'object' && user.avatar
      ? String((user.avatar as { url?: string }).url ?? '')
      : undefined,
  status: user.isBlocked ? 'blocked' : 'active',
  createdAt: String(user.createdAt ?? ''),
});

const mapStaff = (user: Record<string, unknown>): StaffUser => ({
  id: String(user.id ?? ''),
  name: String(user.name ?? ''),
  email: String(user.email ?? ''),
  phone: user.phone ? String(user.phone) : undefined,
  role: String(user.role ?? ''),
  status: user.isActive === false ? 'inactive' : 'active',
  lastLogin: user.lastLoginAt ? String(user.lastLoginAt) : undefined,
  createdAt: String(user.createdAt ?? ''),
});

export const customersService = {
  list: async (params: QueryParams): Promise<Paginated<Customer>> => {
    const res = await api.get('/users', {
      params: { ...params, role: params.role ?? 'customer' },
    });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapCustomer) };
  },
  get: async (id: string): Promise<Customer> => {
    const res = await api.get(`/users/${id}`);
    return mapCustomer(unwrapEntity(res, 'user'));
  },
  getOrders: async (_id: string, _params: QueryParams = {}): Promise<Paginated<Order>> => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  }),
  setStatus: async (id: string, status: 'active' | 'blocked'): Promise<Customer> => {
    const res = await api.patch(`/users/${id}/status`, {
      isBlocked: status === 'blocked',
      isActive: status === 'active',
    });
    return mapCustomer(unwrapEntity(res, 'user'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const staffUsersService = {
  list: async (params: QueryParams): Promise<Paginated<StaffUser>> => {
    const res = await api.get('/users', {
      params: { ...params, role: params.role ?? 'admin' },
    });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapStaff) };
  },
  get: async (id: string): Promise<StaffUser> => {
    const res = await api.get(`/users/${id}`);
    return mapStaff(unwrapEntity(res, 'user'));
  },
  create: async (payload: Partial<StaffUser> & { password: string }): Promise<StaffUser> => {
    const res = await api.post('/auth/register', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: 'customer',
    });
    const data = unwrap<{ user: Record<string, unknown> }>(res);
    const user = data.user;
    if (payload.role && user.id) {
      const roleRes = await api.patch(`/admin/users/${user.id}/role`, { role: payload.role });
      return mapStaff(unwrapEntity(roleRes, 'user'));
    }
    return mapStaff(user);
  },
  update: async (id: string, payload: Partial<StaffUser>): Promise<StaffUser> => {
    if (payload.role) {
      const res = await api.patch(`/admin/users/${id}/role`, { role: payload.role });
      return mapStaff(unwrapEntity(res, 'user'));
    }
    if (payload.status) {
      return staffUsersService.setStatus(id, payload.status);
    }
    const res = await api.get(`/users/${id}`);
    return mapStaff(unwrapEntity(res, 'user'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  setStatus: async (id: string, status: 'active' | 'inactive'): Promise<StaffUser> => {
    const res = await api.patch(`/users/${id}/status`, {
      isActive: status === 'active',
      isBlocked: status === 'inactive',
    });
    return mapStaff(unwrapEntity(res, 'user'));
  },
};
