import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { SatisfactionSurveyModal } from '@/components/ui/SatisfactionSurveyModal';
import { Button } from '@/components/ui/Button';
import { Notification } from '@/types';
import { Bell, AlertTriangle, CheckCircle2, CheckCheck, Check, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface PaginatedNotifications {
  items: Notification[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

function extractDaysOverdue(message: string): number | null {
  const match = message.match(/hace (\d+) día/);
  return match ? parseInt(match[1]) : null;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [surveyLoanId, setSurveyLoanId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', user?.id, page],
    queryFn: async () => {
      const { data } = await api.get<PaginatedNotifications>(`/notifications`, {
        params: { pageNumber: page, pageSize }
      });
      return data;
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Notificación eliminada');
    },
  });

  if (isLoading) return <p className="text-cara-500">Cargando...</p>;

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cara-900">Notificaciones</h1>
        <div className="flex items-center gap-2">
          {data && data.items.some(n => !n.isRead) && (
            <Button variant="secondary" size="sm" onClick={() => markAllAsRead.mutate()} isLoading={markAllAsRead.isPending}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas leídas
            </Button>
          )}
          <Bell className="h-5 w-5 text-cara-400" />
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-cara-300 mx-auto mb-3" />
            <p className="text-cara-500">No tenés notificaciones</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const isOverdue = n.type === 'LoanOverdue';
            const isReturned = n.type === 'LoanReturned';
            const daysOverdue = isOverdue ? extractDaysOverdue(n.message) : null;
            const isActive = isOverdue && !n.isRead;

            return (
              <Card
                key={n.id}
                className={clsx(
                  n.isRead && !isOverdue && !isReturned && 'opacity-60',
                  isOverdue && [
                    'border-2 shadow-lg',
                    isActive
                      ? 'border-red-400 bg-red-50 shadow-red-200'
                      : 'border-red-200 bg-red-50/50 shadow-red-100',
                  ],
                  isReturned && [
                    'border-2 border-green-400 bg-green-50 shadow-lg shadow-green-200',
                  ],
                )}
              >
                <div className="flex items-start gap-3">
                  {isOverdue && (
                    <div className="shrink-0 mt-1">
                      <AlertTriangle className={clsx('h-6 w-6', isActive ? 'text-red-500' : 'text-red-300')} />
                    </div>
                  )}
                  {isReturned && (
                    <div className="shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={clsx(
                          'font-semibold',
                          isOverdue && isActive && 'text-red-700 blink-title text-base',
                          isOverdue && !isActive && 'text-red-500 text-base',
                          isReturned && 'text-green-700 text-base',
                          !isOverdue && !isReturned && 'text-cara-900',
                        )}
                      >
                        {n.title}
                        {daysOverdue !== null && (
                          <span className={clsx(
                            'ml-2 inline-flex items-center justify-center text-white text-xs font-bold rounded-full px-2 py-0.5',
                            isActive ? 'bg-red-600' : 'bg-red-300',
                          )}>
                            {daysOverdue}d
                          </span>
                        )}
                      </h3>
                      <Badge status={n.type} />
                    </div>
                    <p
                      className={clsx(
                        'text-sm mt-1',
                        isOverdue && 'text-red-600 font-medium',
                        isReturned && 'text-green-700 font-medium',
                        !isOverdue && !isReturned && 'text-cara-600',
                      )}
                    >
                      {n.message}
                      {isReturned && n.referenceId && (
                          <Button variant="ghost" size="sm" className="ml-2 underline text-green-700" onClick={() => setSurveyLoanId(n.referenceId!)}>
                            Completar encuesta
                          </Button>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-cara-400">
                        {new Date(n.sentAt).toLocaleString()}
                      </p>
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" className="text-xs text-cara-500 hover:text-cara-700 h-auto p-0" onClick={() => markAsRead.mutate(n.id)} isLoading={markAsRead.isPending}>
                          <Check className="h-3 w-3 mr-1" />
                          Marcar leída
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs text-danger hover:text-red-700 h-auto p-0 ml-1" onClick={() => deleteNotification.mutate(n.id)} isLoading={deleteNotification.isPending}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      )}
      {surveyLoanId && (
        <SatisfactionSurveyModal
          loanId={surveyLoanId}
          isOpen={!!surveyLoanId}
          onClose={() => setSurveyLoanId(null)}
          onSuccess={() => setSurveyLoanId(null)}
        />
      )}
    </div>
  );
}
