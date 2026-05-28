import api from './api';
import { Asset, PaginatedList } from '@/types';

export const assetService = {
  async getAll(params?: {
    searchTerm?: string;
    category?: string;
    status?: string;
    department?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedList<Asset>> {
    const { data } = await api.get<PaginatedList<Asset>>('/assets', { params });
    return data;
  },

  async getById(id: string): Promise<Asset> {
    const { data } = await api.get<Asset>(`/assets/${id}`);
    return data;
  },

  async create(asset: {
    code: string;
    name: string;
    category: string;
    department: string;
    location: string;
    description?: string;
    imageUrl?: string;
    maxLoanDays: number;
  }): Promise<Asset> {
    const { data } = await api.post<Asset>('/assets', asset);
    return data;
  },

  async update(id: string, asset: {
    name: string;
    category: string;
    department: string;
    location: string;
    description?: string;
    imageUrl?: string;
    maxLoanDays: number;
  }): Promise<Asset> {
    const { data } = await api.put<Asset>(`/assets/${id}`, { id, ...asset });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async getZpl(assetIds: string[], frontendUrl?: string): Promise<Blob> {
    const { data } = await api.post<Blob>('/assets/zpl', { assetIds, frontendUrl }, {
      responseType: 'blob',
    });
    return data;
  },
};
