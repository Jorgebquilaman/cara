import api from './api';
import { Loan, Contract } from '@/types';

export const loanService = {
  async getActive(): Promise<Loan[]> {
    const { data } = await api.get<Loan[]>('/loans/active');
    return data;
  },

  async getByUser(userId: string): Promise<Loan[]> {
    const { data } = await api.get<Loan[]>(`/loans/user/${userId}`);
    return data;
  },

  async create(loan: { assetId: string; startDate: string; dueDate: string; userId?: string; observations?: string; prenda?: number }): Promise<Loan> {
    const { data } = await api.post<Loan>('/loans', {
      ...loan,
      userId: loan.userId ?? JSON.parse(localStorage.getItem('cara_user') || '{}').id,
    });
    return data;
  },

  async approve(id: string): Promise<void> {
    await api.post(`/loans/${id}/approve`);
  },

  async pickup(id: string): Promise<void> {
    await api.post(`/loans/${id}/pickup`);
  },

  async pickupWithContract(id: string): Promise<Contract> {
    const { data } = await api.post<Contract>(`/loans/${id}/pickup-with-contract`);
    return data;
  },

  async reject(id: string, reason: string): Promise<void> {
    await api.post(`/loans/${id}/reject`, { reason });
  },

  async returnAsset(id: string, incidentDescription?: string, incidentPhotoUrl?: string, userRating?: number, userRatingComment?: string): Promise<void> {
    await api.post(`/loans/${id}/return`, { incidentDescription, incidentPhotoUrl, userRating, userRatingComment });
  },

  async getPastDue(): Promise<Loan[]> {
    const { data } = await api.get<Loan[]>('/loans/past-due');
    return data;
  },

  async sendOverdueAlert(id: string): Promise<void> {
    await api.post(`/loans/${id}/send-overdue-alert`);
  },
};
