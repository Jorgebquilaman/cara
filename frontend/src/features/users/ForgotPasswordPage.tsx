import { useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center space-y-4 rounded-xl border bg-white p-8 shadow-sm">
          <div className="text-4xl">📧</div>
          <h1 className="text-xl font-bold text-cara-900">Revisá tu correo</h1>
          <p className="text-sm text-cara-500">
            Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.
          </p>
          <a href="/login" className="block text-sm text-cara-600 hover:underline">Volver al inicio de sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/imagenes/logo%20cara.png" alt="CARA" className="w-full object-contain rounded-xl border bg-white p-6 shadow-sm" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cara-900 text-center">Recuperar contraseña</h2>
          <p className="text-sm text-cara-500 text-center">Ingresá tu email institucional</p>
          <Input
            label="Email institucional"
            type="email"
            placeholder="usuario@iupa.edu.ar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" isLoading={loading}>Enviar enlace</Button>
          <a href="/login" className="block text-center text-sm text-cara-600 hover:underline">Volver al inicio de sesión</a>
        </form>
      </div>
    </div>
  );
}
