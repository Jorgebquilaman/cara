import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { MapPin, MoreHorizontal } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.title || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <h1 className="page-title">Mi Perfil</h1>

      <div className="card-surface p-6 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-16 w-16 rounded-full bg-mist text-sage flex items-center justify-center text-xl font-medium">
            {(user?.fullName ?? 'U').split(' ').slice(0, 2).map((n) => n[0]).join('')}
          </div>
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-sage" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate">{user?.fullName}</p>
          <p className="text-xs text-ink-muted capitalize">{user?.role}</p>
          <p className="text-xs text-ink-muted flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" strokeWidth={1.5} />
            IUPA — Instituto Universitario Patagónico de las Artes
          </p>
        </div>
        <button
          type="button"
          aria-label="Más opciones"
          className="h-9 w-9 rounded-full flex items-center justify-center text-ink-muted hover:bg-mist/60 hover:text-ink transition-colors duration-150"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <Card>
        <h2 className="section-title mb-4">Información del Sistema</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-cara-500">Nombre</dt>
            <dd className="font-medium text-cara-900">{user?.fullName}</dd>
          </div>
          <div>
            <dt className="text-cara-500">Email</dt>
            <dd className="font-medium text-cara-900">{user?.institutionalEmail}</dd>
          </div>
          <div>
            <dt className="text-cara-500">Rol</dt>
            <dd className="font-medium text-cara-900">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-cara-500">Miembro desde</dt>
            <dd className="font-medium text-cara-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-cara-500">Préstamos activos</dt>
            <dd className="font-medium text-cara-900">{user?.activeLoanCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-cara-500">Sanciones activas</dt>
            <dd className="font-medium text-cara-900">{user?.hasActiveSanctions ? 'Sí' : 'No'}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-cara-900">Cambiar Contraseña</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Contraseña actual</label>
            <input
              type="password"
              className="w-full h-11 rounded-full border border-transparent bg-[var(--surface)] px-4 text-sm text-ink shadow-[var(--shadow-inset)] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Nueva contraseña</label>
            <input
              type="password"
              className="w-full h-11 rounded-full border border-transparent bg-[var(--surface)] px-4 text-sm text-ink shadow-[var(--shadow-inset)] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Confirmar nueva contraseña</label>
            <input
              type="password"
              className="w-full h-11 rounded-full border border-transparent bg-[var(--surface)] px-4 text-sm text-ink shadow-[var(--shadow-inset)] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>
              Cambiar contraseña
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
