import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Bell,
  AlertTriangle,
  Clock,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Settings,
  UserPlus,
  GraduationCap,
  MessageSquare,
  CalendarDays,
  Upload,
  FileSignature,
  Moon,
  Sun,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { connectNotificationHub, disconnectHubs } from '@/services/signalr';
import toast from 'react-hot-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

const navItems: { to: string; icon: any; label: string; roles: string[]; section: string }[] = [
  { to: '/', icon: LayoutDashboard, label: 'Panel de Control', roles: ['Admin', 'Staff', 'Teacher', 'Student'], section: 'GENERAL' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendario', roles: ['Admin', 'Staff', 'Teacher', 'Student'], section: 'GENERAL' },
  { to: '/notifications', icon: Bell, label: 'Notificaciones', roles: ['Admin', 'Staff', 'Teacher', 'Student'], section: 'GENERAL' },

  { to: '/loans', icon: BookOpen, label: 'Préstamos', roles: ['Admin', 'Staff'], section: 'PRÉSTAMOS Y RESERVAS' },
  { to: '/loans/overdue', icon: Clock, label: 'Vencidos', roles: ['Admin', 'Staff'], section: 'PRÉSTAMOS Y RESERVAS' },
  { to: '/my-loans', icon: BookOpen, label: 'Mis Préstamos', roles: ['Teacher', 'Student'], section: 'PRÉSTAMOS Y RESERVAS' },
  { to: '/my-surveys', icon: MessageSquare, label: 'Mis Encuestas', roles: ['Teacher', 'Student'], section: 'PRÉSTAMOS Y RESERVAS' },
  { to: '/reservations', icon: Calendar, label: 'Reservas', roles: ['Admin', 'Staff', 'Teacher', 'Student'], section: 'PRÉSTAMOS Y RESERVAS' },
  { to: '/contracts', icon: FileSignature, label: 'Contratos', roles: ['Admin', 'Staff'], section: 'PRÉSTAMOS Y RESERVAS' },

  { to: '/assets', icon: Package, label: 'Activos', roles: ['Admin', 'Staff'], section: 'INVENTARIO' },
  { to: '/assets/import', icon: Upload, label: 'Importar', roles: ['Admin'], section: 'INVENTARIO' },

  { to: '/users', icon: Users, label: 'Usuarios', roles: ['Admin'], section: 'ADMINISTRACIÓN' },
  { to: '/solicitudes-alta', icon: UserPlus, label: 'Solicitudes Alta', roles: ['Admin'], section: 'ADMINISTRACIÓN' },
  { to: '/departamentos', icon: GraduationCap, label: 'Departamentos', roles: ['Admin'], section: 'ADMINISTRACIÓN' },
  { to: '/config-email', icon: Settings, label: 'Config. Email', roles: ['Admin'], section: 'ADMINISTRACIÓN' },

  { to: '/sanctions', icon: ShieldAlert, label: 'Sanciones', roles: ['Admin', 'Staff'], section: 'CONTROL' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidentes', roles: ['Admin', 'Staff'], section: 'CONTROL' },
  { to: '/reports', icon: FileText, label: 'Reportes', roles: ['Admin', 'Staff'], section: 'CONTROL' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data: pendingRequests } = useQuery({
    queryKey: ['account-requests', 'pending-count'],
    queryFn: async () => {
      const { data } = await api.get('/account-requests/pending/count');
      return data.count as number;
    },
    refetchInterval: 30000,
    enabled: user?.role === 'Admin',
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.count as number;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const token = localStorage.getItem('cara_token');
    if (token) {
      const connection = connectNotificationHub(token);
      
      const handleNotification = (type: string, title: string, message: string) => {
        if (type === 'LoanOverdue') {
          toast.error(
            (t) => (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700 blink-title">{title}</p>
                  <p className="text-sm text-red-600 mt-1">{message}</p>
                </div>
              </div>
            ),
            {
              duration: 8000,
              style: {
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
              },
            },
          );
        } else {
          toast.success(`${title}: ${message}`, {
            duration: 5000,
            icon: '🔔',
          });
        }
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      };

      connection.on('ReceiveNotification', handleNotification);

      return () => {
        connection.off('ReceiveNotification', handleNotification);
        disconnectHubs();
      };
    }
  }, [queryClient]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  /* Agrupar ítems visibles por sección, preservando el orden */
  const sections: { name: string; items: typeof visibleItems }[] = [];
  for (const item of visibleItems) {
    const last = sections[sections.length - 1];
    if (last && last.name === item.section) {
      last.items.push(item);
    } else {
      sections.push({ name: item.section, items: [item] });
    }
  }

  const isStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const bottomNavItems = isStaff
    ? [
        { to: '/', icon: LayoutDashboard, label: 'Inicio' },
        { to: '/assets', icon: Package, label: 'Activos' },
        { to: '/loans', icon: BookOpen, label: 'Préstamos' },
        { to: '/reservations', icon: Calendar, label: 'Reservas' },
        { to: '/calendar', icon: CalendarDays, label: 'Calendario' },
      ]
    : [
        { to: '/', icon: LayoutDashboard, label: 'Inicio' },
        { to: '/my-loans', icon: BookOpen, label: 'Préstamos' },
        { to: '/reservations', icon: Calendar, label: 'Reservas' },
        { to: '/calendar', icon: CalendarDays, label: 'Calendario' },
        { to: '/notifications', icon: Bell, label: 'Avisos' },
      ];

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#121212]">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 transform bg-gradient-to-b from-[#1F6E4A] to-[#123a27] text-white transition-all lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className={clsx('flex h-16 items-center border-b border-white/10', collapsed ? 'justify-center px-0' : 'gap-3 px-5')}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <Menu className="h-5 w-5" />
          </button>
          {!collapsed && (
            <>
              <svg viewBox="0 0 54 54" className="h-9 w-9 shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M34,13.1h-2.6c-.2,0-.3,0-.3.3v6c0,1.5-.6,2.4-2.1,2.4s-2-.9-2-2.4v-6.2c0,0,0-.2-.1-.2s-2.6,0-2.7,0-.2,0-.2.2c0,0,0,5.2,0,7s1.4,4.2,5,4.2,5.1-2.1,5.1-4.2,0-6.8,0-7,0-.2-.2-.2Z"/>
                <path d="M22.5,13.1c-.1,0-2.6,0-2.7,0-.1,0-.2,0-.2.2s0,10.6,0,10.7c0,.2,0,.2.2.2s2.5,0,2.6,0,.2-.1.2-.2v-10.8c0,0,0-.2-.1-.2Z"/>
                <path d="M27.1,4.7C14.8,4.7,4.8,14.7,4.8,27s10,22.3,22.3,22.3,22.3-10,22.3-22.3S39.4,4.7,27.1,4.7ZM22.9,42.6c0,.1-.3.1-.3,0,0-.2,0-9.6,0-9.6,0,0,1,0,1.9,0,1.4,0,2.3-.6,2.3-.6,0,0-4,10.1-4,10.2ZM22.7,30.5v-2.9s.8,0,1.2,0,1.5,0,1.5,1.4-1.1,1.4-1.5,1.4-1.2,0-1.2,0ZM31.4,43.2c-2.4,0-4.3-2-4.3-4.3,0-2.4,2-4.3,4.3-4.3,2.4,0,4.3,2,4.3,4.3,0,2.4-2,4.3-4.4,4.3ZM29.8,32.5l1.6-4.7,1.7,4.7h-3.3ZM35.7,32.4s-2.6-7-2.7-7c0,0,0-.1-.1-.1,0,0-3,0-3.1,0s-.1,0-.2.1c0,0-1.2,3.1-1.2,3.1,0,0-.2-3.2-4-3.2s-4.6,0-4.6,0-.1,0-.1.1,0,7.7,0,8.4c-.9,0-1.3-.4-1.3-1.1s0-18.5,0-19.2c0-1.1.7-1.6,1.6-1.6s13.8,0,14.6,0c1.1,0,1.2.7,1.2,1.6s0,18.9,0,18.9Z"/>
                <path d="M27.1,2.2C13.4,2.2,2.3,13.3,2.3,27s11.1,24.8,24.8,24.8,24.8-11.1,24.8-24.8S40.8,2.2,27.1,2.2ZM27.1,50.3c-12.8,0-23.3-10.4-23.3-23.3S14.2,3.7,27.1,3.7s23.3,10.4,23.3,23.3-10.4,23.3-23.3,23.3Z"/>
              </svg>
              <div>
                <h1 className="text-base font-bold tracking-wide text-white">CARA</h1>
                <p className="text-[10px] text-white/50 leading-tight">IUPA</p>
              </div>
            </>
          )}
          <button onClick={() => setSidebarOpen(false)} className={clsx('text-white/60 hover:text-white', collapsed ? 'lg:hidden' : 'lg:hidden ml-auto')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-3 px-3 space-y-4 overflow-y-auto max-h-[calc(100vh-11rem)] pb-4">
          {sections.map((section) => (
            <div key={section.name}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 select-none">
                  {section.name}
                </p>
              )}
              {collapsed && <div className="mx-3 mb-2 border-t border-white/10" />}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const badgeCount =
                    item.to === '/notifications' ? (unreadCount ?? 0) :
                    item.to === '/solicitudes-alta' ? (pendingRequests ?? 0) :
                    0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                          collapsed ? 'justify-center' : 'gap-3',
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && badgeCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7fc9c4] px-1.5 text-[10px] font-bold text-[#123a27]">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                      {collapsed && badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7fc9c4] text-[10px] font-bold text-[#123a27]">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4 bg-gradient-to-b from-transparent to-black/20">
          <div className={clsx('flex items-center', collapsed ? 'flex-col gap-3' : 'justify-between')}>
            {!collapsed && (
              <button
                onClick={() => { navigate('/mi-perfil'); setSidebarOpen(false); }}
                className="text-left hover:opacity-80 transition-opacity"
              >
                <p className="font-semibold text-white text-sm">{user?.fullName}</p>
                <p className="text-white/50 text-xs">{user?.role}</p>
              </button>
            )}
            <div className={clsx('flex items-center gap-1', collapsed && 'flex-col')}>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-6 lg:hidden dark:bg-[#1A1A1A] dark:border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="text-cara-600 dark:text-cara-400">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-extrabold text-cara-700 dark:text-cara-400">CARA</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-white/5 lg:hidden">
          <div className="flex justify-around items-center px-2 py-2">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[3.5rem] transition-colors',
                    isActive
                      ? 'text-cara-600 dark:text-cara-400'
                      : 'text-gray-400 dark:text-gray-500 hover:text-cara-600 dark:hover:text-cara-400',
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
