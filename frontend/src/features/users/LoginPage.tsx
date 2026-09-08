import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useForceLightTheme } from '@/hooks/useTheme';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  useForceLightTheme();
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
    <div className="flex min-h-screen bg-[#1f3d33]">
      {/* ============ PANEL IZQUIERDO (blanco) ============ */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-white py-10 pl-12 pr-16 relative z-10">
        {/* Logo institución */}
        <div>
          {/* Reemplazar src por el logo definitivo de la institución si cambia */}
          <img
            src="/imagenes/logo-iupa.svg"
            alt="Logo IUPA"
            className="h-14 w-auto"
          />
        </div>

        {/* Ilustración / imagen de portada */}
        <div className="flex flex-1 items-center justify-center py-10">
          {/* Placeholder de portada: reemplazar por una ilustración/foto del instituto */}
          <img
            src="/imagenes/logo%20cara.png"
            alt="CARA"
            className="max-h-72 w-auto object-contain opacity-90"
          />
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-400 leading-relaxed">
          <p>© {new Date().getFullYear()} IUPA — Instituto Universitario Patagónico de las Artes</p>
          <p>Powered by CARA</p>
        </div>
      </div>

      {/* ============ DIVISOR ORGÁNICO (curva irregular) ============ */}
      <svg
        className="hidden lg:block h-screen w-[90px] shrink-0 fill-white"
        viewBox="0 0 90 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,0 H45 C85,120 15,240 55,360 C90,460 20,560 50,660 C80,750 30,830 55,900 H0 Z" />
      </svg>

      {/* ============ PANEL DERECHO (verde oscuro) ============ */}
      <div className="flex-1 relative flex flex-col justify-center px-6 py-12">
        <div className="w-full max-w-[380px] mx-auto">
          {/* Mobile: logo arriba del formulario */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <img
              src="/imagenes/logo-iupa.svg"
              alt="Logo IUPA"
              className="h-12 w-auto mb-6"
            />
          </div>

          <h1 className="text-5xl font-bold text-white mb-10">Login</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="field-on-dark space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Usuario
              </label>
              <input
                id="email"
                type="email"
                placeholder="usuario@iupa.edu.ar"
                className="w-full rounded-lg bg-black/20 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[#7fc9c4] focus:ring-1 focus:ring-[#7fc9c4]/40 transition-colors"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg bg-black/20 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[#7fc9c4] focus:ring-1 focus:ring-[#7fc9c4]/40 transition-colors"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <p className="text-sm text-red-300 text-center">{errors.root.message}</p>
            )}

            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-xs text-gray-300 underline underline-offset-2 hover:text-white transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#7fc9c4] py-3 text-base font-bold text-[#1f3d33] transition-all hover:bg-[#6db8b3] hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-[#7fc9c4]/50"
            >
              {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
            </button>

            <p className="text-center text-sm text-gray-300 pt-2">
              ¿No tenés una cuenta?{' '}
              <a
                href="/solicitar-alta"
                className="underline underline-offset-2 text-white hover:text-[#7fc9c4] transition-colors"
              >
                Registrate ahora
              </a>
            </p>

            <p className="text-center pt-4">
              <a
                href="#"
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-200 transition-colors"
              >
                Términos y Servicios
              </a>
            </p>
          </form>
        </div>

        {/* Pie derecho: contacto */}
        <div className="absolute bottom-5 right-8 text-xs text-gray-400 hidden md:block">
          ¿Tenés algún problema? Contactanos a{' '}
          <a
            href="mailto:soporte@iupa.edu.ar"
            className="underline underline-offset-2 text-gray-300 hover:text-white transition-colors"
          >
            soporte@iupa.edu.ar
          </a>
        </div>
      </div>
    </div>
  );
}
