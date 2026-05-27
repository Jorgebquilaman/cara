import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate('/', { replace: true });
    } catch {
      setError('root', { message: 'Credenciales inválidas' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img
            src="/imagenes/logo%20cara.png"
            alt="CARA Logo"
            className="w-full object-contain rounded-xl border bg-white p-6 shadow-sm"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <Input
            label="Email institucional"
            type="email"
            placeholder="usuario@iupa.edu.ar"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {errors.root && (
            <p className="text-sm text-danger text-center">{errors.root.message}</p>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Iniciar Sesión
          </Button>

          <div className="flex flex-col items-center gap-2 text-sm">
            <a href="/forgot-password" className="text-cara-600 hover:underline">Olvidé mi contraseña</a>
            <a href="/solicitar-alta" className="text-cara-600 hover:underline">Solicitar alta de usuario</a>
          </div>
        </form>
      </div>
    </div>
  );
}
