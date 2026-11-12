import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen bg-sage">
      {/* ============ PANEL IZQUIERDO (blanco) ============ */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-[var(--surface)] py-10 pl-12 pr-16 relative z-10">
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
        <div className="text-[11px] text-ink-muted leading-relaxed">
          <p>© {new Date().getFullYear()} IUPA — Instituto Universitario Patagónico de las Artes</p>
          <p>Powered by CARA</p>
        </div>
      </div>

      {/* ============ DIVISOR ORGÁNICO (curva irregular) ============ */}
      <svg
        className="hidden lg:block h-screen w-[90px] shrink-0 fill-[var(--surface)]"
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

          <h1 className="text-5xl font-light tracking-page uppercase text-ivory mb-10">Login</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="field-on-dark space-y-5">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-ivory/80 mb-2">
                Usuario
              </label>
              <input
                id="email"
                type="email"
                placeholder="usuario@iupa.edu.ar"
                className="w-full rounded-full bg-white/10 border border-white/20 px-5 py-3 text-sm text-ivory placeholder:text-ivory/50 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-sage transition-all duration-200"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-ivory/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-black/20 border border-white/15 px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-cara-200 focus:ring-1 focus:ring-cara-200/40 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <p className="text-sm text-red-300 text-center">{errors.root.message}</p>
            )}

            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-xs text-ivory/70 underline underline-offset-2 hover:text-ivory transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-ivory py-3 text-[15px] font-medium text-sage shadow-soft-sm transition-all duration-200 hover:bg-white hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-sage"
            >
              {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
            </button>

            <p className="text-center text-sm text-ivory/70 pt-2">
              ¿No tenés una cuenta?{' '}
              <a
                href="/solicitar-alta"
                className="underline underline-offset-2 text-ivory hover:text-mist transition-colors"
              >
                Registrate ahora
              </a>
            </p>

            <p className="text-center pt-4">
              <a
                href="#"
                className="text-xs text-ivory/60 underline underline-offset-2 hover:text-ivory transition-colors"
              >
                Términos y Servicios
              </a>
            </p>
          </form>
        </div>

        {/* Pie derecho: contacto */}
        <div className="absolute bottom-5 right-8 text-xs text-ivory/60 hidden md:block">
          ¿Tenés algún problema? Contactanos a{' '}
          <a
            href="mailto:soporte@iupa.edu.ar"
            className="underline underline-offset-2 text-ivory/80 hover:text-ivory transition-colors"
          >
            soporte@iupa.edu.ar
          </a>
        </div>
      </div>
    </div>
  );
}
