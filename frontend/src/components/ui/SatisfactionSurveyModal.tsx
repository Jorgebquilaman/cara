import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Star } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface Props {
  loanId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SatisfactionSurveyModal({ loanId, isOpen, onClose, onSuccess }: Props) {
  const [overall, setOverall] = useState(0);
  const [service, setService] = useState(0);
  const [time, setTime] = useState(0);
  const [quality, setQuality] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (overall === 0 || service === 0 || time === 0 || quality === 0) {
      toast.error('Por favor, completa todas las valoraciones.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/surveys', {
        loanId,
        overallRating: overall,
        serviceRating: service,
        requestTimeRating: time,
        assetQualityRating: quality,
        comments
      });
      toast.success('¡Gracias por tu opinión!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al enviar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const RatingInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`cursor-pointer ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Encuesta de Satisfacción">
      <div className="space-y-4 pt-4">
        <RatingInput label="Valoración General" value={overall} onChange={setOverall} />
        <RatingInput label="Atención recibida" value={service} onChange={setService} />
        <RatingInput label="Tiempo de solicitud" value={time} onChange={setTime} />
        <RatingInput label="Calidad del activo" value={quality} onChange={setQuality} />
        
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Comentarios (opcional)</label>
            <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
            />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={loading}>Enviar Encuesta</Button>
        </div>
      </div>
    </Modal>
  );
}