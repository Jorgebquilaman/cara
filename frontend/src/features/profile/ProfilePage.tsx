import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/services/api';

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
      <h1 className="text-2xl font-bold text-cara-900">Mi Perfil</h1>

      <div className="flex justify-center card-surface px-8">
        <img
          src="/imagenes/logo%20cara.png"
          alt="CARA Logo"
          className="w-full max-h-80 object-contain"
        />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-cara-900">Información del Sistema</h2>
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

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-cara-900">Cambiar Contraseña</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Contraseña actual</label>
            <input
              type="password"
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Nueva contraseña</label>
            <input
              type="password"
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Confirmar nueva contraseña</label>
            <input
              type="password"
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
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
