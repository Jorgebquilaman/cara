import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import toast from 'react-hot-toast';

export function useAssets(params?: {
  searchTerm?: string;
  category?: string;
  status?: string;
  department?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetService.getAll(params),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Activo creado exitosamente');
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; category: string; department: string; location: string; description?: string; imageUrl?: string; maxLoanDays: number }) =>
      assetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Activo actualizado exitosamente');
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Activo eliminado exitosamente');
    },
  });
}
