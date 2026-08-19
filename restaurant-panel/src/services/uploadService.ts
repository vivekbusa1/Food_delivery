import { apiClient } from './apiClient';
import type { ApiResponse, UploadResult } from '@/types';

export const uploadService = {
  async uploadImage(file: File, _folder = 'misc'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<
      ApiResponse<{ file?: { url?: string }; url?: string } | UploadResult>
    >('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const payload = data.data;
    if (payload && typeof payload === 'object') {
      if ('file' in payload && payload.file?.url) return { url: payload.file.url };
      if ('url' in payload && payload.url) return { url: String(payload.url) };
    }
    return { url: '' };
  },
};
