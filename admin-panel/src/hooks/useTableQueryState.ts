import { useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import type { QueryParams } from '@/types';

interface UseTableQueryStateOptions {
  initialLimit?: number;
  extraFilters?: Record<string, unknown>;
}

/**
 * Centralizes the paging / searching / filtering state shared by every
 * list page, and produces the params object ready to hand to React Query.
 */
export function useTableQueryState(options: UseTableQueryStateOptions = {}) {
  const { initialLimit = DEFAULT_PAGE_SIZE, extraFilters = {} } = options;

  const [page, setPage] = useState(0); // zero-based for MUI TablePagination
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>(extraFilters);

  const debouncedSearch = useDebounce(search, 400);

  const params: QueryParams = useMemo(
    () => ({
      page: page + 1,
      limit,
      search: debouncedSearch || undefined,
      ...filters,
    }),
    [page, limit, debouncedSearch, filters]
  );

  const setFilter = (key: string, value: unknown) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [key]: value === '' ? undefined : value }));
  };

  const onSearchChange = (value: string) => {
    setPage(0);
    setSearch(value);
  };

  return {
    page,
    setPage,
    limit,
    setLimit: (value: number) => {
      setLimit(value);
      setPage(0);
    },
    search,
    setSearch: onSearchChange,
    filters,
    setFilter,
    params,
  };
}
