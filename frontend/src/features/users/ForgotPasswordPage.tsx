import { useState, type ReactNode } from 'react';
import { useForceLightTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const ContentWrapper = ({ children }: { children: ReactNode }) => {
  useForceLightTheme();
  return (
  <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#121212] p-4">
    <div className="flex w-full max-w-4xl flex-col md:flex-row overflow-hidden rounded-3xl bg-white dark:bg-[#1E1E1E] shadow-2xl">
      <div className="hidden md:flex md:w-1/2 bg-cara-900 items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-cara-950/20" />
        <div className="relative z-10 text-white text-center">
          <img
            src="/imagenes/logo%20cara.png"
            alt="CARA Logo"
            className="w-48 h-48 object-contain mb-8 mx-auto bg-white rounded-full p-4"
          />
          <h1 className="text-3xl font-bold mb-2">Recuperar Acceso</h1>
          <p className="text-cara-200">Restablecé tu contraseña de forma segura.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="md:hidden text-center mb-8">
          <img
            src="/imagenes/logo%20cara.png"
            alt="CARA Logo"
            className="w-24 h-24 object-contain mx-auto"
          />
        </div>
        {children}
      </div>
    </div>
  </div>
  );
};

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
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al procesar la solicitud';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ContentWrapper>
        <div className="text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-bold text-cara-900 dark:text-cara-400">Revisá tu correo</h1>
          <p className="text-sm text-cara-500">
            Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.
          </p>
          <a href="/login" className="block text-sm text-cara-600 hover:underline">Volver al inicio de sesión</a>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <h2 className="text-2xl font-bold text-cara-900 dark:text-cara-400 mb-6 text-center md:text-left">Recuperar contraseña</h2>
      <p className="text-sm text-cara-500 mb-6 text-center md:text-left">Ingresá tu email institucional y te enviaremos los pasos a seguir.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email institucional"
          type="email"
          placeholder="usuario@iupa.edu.ar"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Enviar enlace
        </Button>
        
        <div className="flex flex-col items-center gap-3 text-sm mt-6">
          <a href="/login" className="text-cara-600 hover:text-cara-800 dark:text-cara-400 dark:hover:text-cara-300 hover:underline">Volver al inicio de sesión</a>
          <p className="text-xs text-danger text-center mt-4 border-t pt-4">
            Recordá: Si tu cuenta no está activa, debés esperar a que un administrativo autorice tu acceso al sistema.
          </p>
        </div>
      </form>
    </ContentWrapper>
  );
}
