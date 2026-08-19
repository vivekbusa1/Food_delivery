export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface UploadResult {
  url: string;
}

export type SortOrder = 'asc' | 'desc';

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}
