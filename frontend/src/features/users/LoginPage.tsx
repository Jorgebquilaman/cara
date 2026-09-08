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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#121212] p-4">
      {/* Ticket Container */}
      <div className="flex w-full max-w-4xl flex-col md:flex-row overflow-hidden rounded-3xl bg-white dark:bg-[#1E1E1E] shadow-2xl">
        
        {/* Left Side: Image/Branding */}
        <div className="hidden md:flex md:w-1/2 bg-cara-900 items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-cara-950/20" />
          <div className="relative z-10 text-white text-center">
            <img
              src="/imagenes/logo%20cara.png"
              alt="CARA Logo"
              className="w-48 h-48 object-contain mb-8 mx-auto bg-white rounded-full p-4"
            />
            <h1 className="text-3xl font-bold mb-2">Bienvenido a CARA</h1>
            <p className="text-cara-200">Gestioná tus recursos de forma eficiente.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="md:hidden text-center mb-8">
            <img
              src="/imagenes/logo%20cara.png"
              alt="CARA Logo"
              className="w-24 h-24 object-contain mx-auto"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-cara-900 dark:text-cara-400 mb-6 text-center md:text-left">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              Ingresar
            </Button>

            <div className="flex flex-col items-center gap-3 text-sm mt-6">
              <a href="/forgot-password" className="text-cara-600 hover:text-cara-800 dark:text-cara-400 dark:hover:text-cara-300 hover:underline">Olvidé mi contraseña</a>
              <div className="border-t w-full my-1"></div>
              <a href="/solicitar-alta" className="text-cara-600 font-semibold hover:text-cara-800 dark:text-cara-400 dark:hover:text-cara-300 hover:underline">Solicitar alta de usuario</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
