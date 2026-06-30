import api from './api';
import { Contract } from '@/types';

export const contractService = {
  async getAll(): Promise<Contract[]> {
    const { data } = await api.get<Contract[]>('/contracts');
    return data;
  },

  async getById(id: string): Promise<Contract> {
    const { data } = await api.get<Contract>(`/contracts/${id}`);
    return data;
  },

  async create(contract: {
    code: string;
    title: string;
    content?: string;
    provider?: string;
    startDate: string;
    endDate?: string;
    fileUrl?: string;
  }): Promise<Contract> {
    const { data } = await api.post<Contract>('/contracts', contract);
    return data;
  },

  async update(id: string, contract: {
    title: string;
    content?: string;
    provider?: string;
    startDate: string;
    endDate?: string;
    fileUrl?: string;
    status: string;
  }): Promise<Contract> {
    const { data } = await api.put<Contract>(`/contracts/${id}`, { id, ...contract });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contracts/${id}`);
  },
};
