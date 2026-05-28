import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SatisfactionSurveyModal } from '@/components/ui/SatisfactionSurveyModal';
import { MessageSquare, Star, ClipboardCheck } from 'lucide-react';

interface CompletedSurvey {
  id: string;
  loanId: string;
  assetName: string;
  overallRating: number;
  serviceRating: number;
  requestTimeRating: number;
  assetQualityRating: number;
  comments: string | null;
  createdAt: string;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function SurveysPage() {
  const { data: pendingSurveys, refetch } = useQuery({
      queryKey: ['pending-surveys'],
      queryFn: async () => { const { data } = await api.get('/surveys/pending'); return data; },
  });

  const { data: completedSurveys } = useQuery({
      queryKey: ['completed-surveys'],
      queryFn: async () => { const { data } = await api.get<CompletedSurvey[]>('/surveys/completed'); return data; },
  });

  const [surveyLoanId, setSurveyLoanId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-cara-900">Mis Encuestas</h1>
            <p className="text-sm text-cara-500 mt-1">Completá las encuestas de tus préstamos finalizados</p>
        </div>

        <Card title="Encuestas Pendientes">
          {!pendingSurveys || pendingSurveys.length === 0 ? (
              <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-cara-300 mx-auto mb-2" />
                  <p className="text-sm text-cara-500">No tenés encuestas pendientes</p>
              </div>
          ) : (
              <div className="space-y-3">
                  {pendingSurveys.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                          <p className="text-sm font-medium text-cara-800">{s.name}</p>
                          <Button size="sm" variant="secondary" onClick={() => setSurveyLoanId(s.id)}>Completar encuesta</Button>
                      </div>
                  ))}
              </div>
          )}
        </Card>

        <Card title="Encuestas Completadas">
          {!completedSurveys || completedSurveys.length === 0 ? (
              <div className="text-center py-8">
                  <ClipboardCheck className="h-8 w-8 text-cara-300 mx-auto mb-2" />
                  <p className="text-sm text-cara-500">Aún no completaste ninguna encuesta</p>
              </div>
          ) : (
              <div className="space-y-3">
                  {completedSurveys.map((s) => (
                      <div key={s.id} className="p-4 rounded-lg border border-cara-200 bg-white">
                          <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-cara-800">{s.assetName}</p>
                              <span className="text-xs text-cara-400">
                                  {new Date(s.createdAt).toLocaleDateString()}
                              </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-cara-600">
                              <span>General: <StarRating value={s.overallRating} /></span>
                              <span>Atención: <StarRating value={s.serviceRating} /></span>
                              <span>Tiempo: <StarRating value={s.requestTimeRating} /></span>
                              <span>Calidad: <StarRating value={s.assetQualityRating} /></span>
                          </div>
                          {s.comments && (
                              <p className="mt-2 text-xs text-cara-500 italic">"{s.comments}"</p>
                          )}
                      </div>
                  ))}
              </div>
          )}
        </Card>

        {surveyLoanId && (
            <SatisfactionSurveyModal
                loanId={surveyLoanId}
                isOpen={!!surveyLoanId}
                onClose={() => setSurveyLoanId(null)}
                onSuccess={() => { setSurveyLoanId(null); refetch(); }}
            />
        )}
    </div>
  );
}