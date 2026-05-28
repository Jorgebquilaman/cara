import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '@/services/loanService';
import toast from 'react-hot-toast';

import api from '@/services/api';

export function useSendReminder() {
  return useMutation({
    mutationFn: (loanId: string) => api.post(`/notifications/remind/${loanId}`),
    onSuccess: () => {
      toast.success('Recordatorio enviado con éxito');
    },
    onError: () => {
      toast.error('Error al enviar el recordatorio');
    },
  });
}

export function useActiveLoans() {
  return useQuery({
    queryKey: ['loans', 'active'],
    queryFn: loanService.getActive,
  });
}

export function useUserLoans(userId: string) {
  return useQuery({
    queryKey: ['loans', 'user', userId],
    queryFn: () => loanService.getByUser(userId),
    enabled: !!userId,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success(data.message || 'Solicitud de préstamo creada');
    },
  });
}

export function useApproveLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Préstamo aprobado');
    },
  });
}

export function usePickUpLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanService.pickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Retiro confirmado');
    },
  });
}

export function useRejectLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => loanService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Préstamo rechazado');
    },
  });
}

export function usePastDueLoans() {
  return useQuery({
    queryKey: ['loans', 'past-due'],
    queryFn: loanService.getPastDue,
  });
}

export function useSendOverdueAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => loanService.sendOverdueAlert(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Alerta de vencimiento enviada');
    },
    onError: () => {
      toast.error('Error al enviar la alerta');
    },
  });
}

export function useReturnLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, incidentDescription, incidentPhotoUrl }: { id: string; incidentDescription?: string; incidentPhotoUrl?: string }) =>
      loanService.returnAsset(id, incidentDescription, incidentPhotoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Préstamo devuelto');
    },
  });
}
