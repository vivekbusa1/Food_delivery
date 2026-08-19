import api, { unwrap } from './api';
import type { Paginated, QueryParams, Role } from '@/types';

export const rolesService = {
  list: async (_params: QueryParams = {}): Promise<Paginated<Role>> => {
    const res = await api.get('/admin/roles');
    const data = unwrap<{ roles?: string[] }>(res);
    const items = (data.roles ?? []).map((name) => ({
      id: name,
      name,
      description: `${name} platform role`,
      permissions: name === 'admin' ? ['*'] : [],
      usersCount: 0,
      createdAt: new Date().toISOString(),
    }));
    return { items, total: items.length, page: 1, limit: items.length || 10, totalPages: 1 };
  },
  get: async (id: string): Promise<Role> => {
    const list = await rolesService.list();
    const found = list.items.find((role) => role.id === id || role.name === id);
    if (!found) throw new Error('Role not found');
    return found;
  },
  create: async (_payload: Partial<Role>): Promise<Role> => {
    throw new Error('Custom roles are not supported; roles are fixed by the API');
  },
  update: async (_id: string, _payload: Partial<Role>): Promise<Role> => {
    throw new Error('Custom roles are not supported; roles are fixed by the API');
  },
  remove: async (_id: string): Promise<void> => {
    throw new Error('Custom roles are not supported; roles are fixed by the API');
  },
};
