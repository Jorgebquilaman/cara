import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useForceLightTheme } from '@/hooks/useTheme';

export default function ResetPasswordPage() {
  useForceLightTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('Mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Contraseña restablecida correctamente');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#121212] px-4">
        <div className="text-center text-cara-500">Enlace inválido o expirado.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#121212] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/imagenes/logo%20cara.png" alt="CARA" className="w-full object-contain rounded-xl border bg-white p-6 shadow-sm" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1E1E1E] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cara-900 dark:text-cara-400 text-center">Nueva contraseña</h2>
          <Input label="Nueva contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="Confirmar contraseña" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <Button type="submit" className="w-full" isLoading={loading}>Restablecer</Button>
        </form>
      </div>
    </div>
  );
}
