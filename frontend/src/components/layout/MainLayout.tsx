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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { connectNotificationHub, disconnectHubs } from '@/services/signalr';
import toast from 'react-hot-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Staff', 'Teacher', 'Student'] },
  { to: '/assets', icon: Package, label: 'Activos', roles: ['Admin', 'Staff'] },
  { to: '/assets/import', icon: Upload, label: 'Importar', roles: ['Admin', 'Staff'] },
  { to: '/my-loans', icon: BookOpen, label: 'Mis Préstamos', roles: ['Teacher', 'Student'] },
  { to: '/my-surveys', icon: MessageSquare, label: 'Mis Encuestas', roles: ['Teacher', 'Student'] },
  { to: '/loans', icon: BookOpen, label: 'Préstamos', roles: ['Admin', 'Staff'] },
  { to: '/loans/overdue', icon: Clock, label: 'Vencidos', roles: ['Admin', 'Staff'] },
  { to: '/reservations', icon: Calendar, label: 'Reservas', roles: ['Admin', 'Staff', 'Teacher', 'Student'] },
  { to: '/calendar', icon: CalendarDays, label: 'Calendario', roles: ['Admin', 'Staff', 'Teacher', 'Student'] },
  { to: '/users', icon: Users, label: 'Usuarios', roles: ['Admin'] },
  { to: '/solicitudes-alta', icon: UserPlus, label: 'Solicitudes Alta', roles: ['Admin'] },
  { to: '/departamentos', icon: GraduationCap, label: 'Departamentos', roles: ['Admin'] },
  { to: '/sanctions', icon: ShieldAlert, label: 'Sanciones', roles: ['Admin', 'Staff'] },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidentes', roles: ['Admin', 'Staff'] },
  { to: '/reports', icon: FileText, label: 'Reportes', roles: ['Admin', 'Staff'] },
  { to: '/notifications', icon: Bell, label: 'Notificaciones', roles: ['Admin', 'Staff', 'Teacher', 'Student'] },
  { to: '/config-email', icon: Settings, label: 'Config. Email', roles: ['Admin'] },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-cara-900 text-white transition-transform lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 px-6 border-b border-cara-700">
          <svg viewBox="0 0 54 54" className="h-9 w-9 shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M34,13.1h-2.6c-.2,0-.3,0-.3.3v6c0,1.5-.6,2.4-2.1,2.4s-2-.9-2-2.4v-6.2c0,0,0-.2-.1-.2s-2.6,0-2.7,0-.2,0-.2.2c0,0,0,5.2,0,7s1.4,4.2,5,4.2,5.1-2.1,5.1-4.2,0-6.8,0-7,0-.2-.2-.2Z"/>
            <path d="M22.5,13.1c-.1,0-2.6,0-2.7,0-.1,0-.2,0-.2.2s0,10.6,0,10.7c0,.2,0,.2.2.2s2.5,0,2.6,0,.2-.1.2-.2v-10.8c0,0,0-.2-.1-.2Z"/>
            <path d="M27.1,4.7C14.8,4.7,4.8,14.7,4.8,27s10,22.3,22.3,22.3,22.3-10,22.3-22.3S39.4,4.7,27.1,4.7ZM22.9,42.6c0,.1-.3.1-.3,0,0-.2,0-9.6,0-9.6,0,0,1,0,1.9,0,1.4,0,2.3-.6,2.3-.6,0,0-4,10.1-4,10.2ZM22.7,30.5v-2.9s.8,0,1.2,0,1.5,0,1.5,1.4-1.1,1.4-1.5,1.4-1.2,0-1.2,0ZM31.4,43.2c-2.4,0-4.3-2-4.3-4.3,0-2.4,2-4.3,4.3-4.3,2.4,0,4.3,2,4.3,4.3,0,2.4-2,4.3-4.4,4.3ZM29.8,32.5l1.6-4.7,1.7,4.7h-3.3ZM35.7,32.4s-2.6-7-2.7-7c0,0,0-.1-.1-.1,0,0-3,0-3.1,0s-.1,0-.2.1c0,0-1.2,3.1-1.2,3.1,0,0-.2-3.2-4-3.2s-4.6,0-4.6,0-.1,0-.1.1,0,7.7,0,8.4c-.9,0-1.3-.4-1.3-1.1s0-18.5,0-19.2c0-1.1.7-1.6,1.6-1.6s13.8,0,14.6,0c1.1,0,1.2.7,1.2,1.6s0,18.9,0,18.9Z"/>
            <path d="M27.1,2.2C13.4,2.2,2.3,13.3,2.3,27s11.1,24.8,24.8,24.8,24.8-11.1,24.8-24.8S40.8,2.2,27.1,2.2ZM27.1,50.3c-12.8,0-23.3-10.4-23.3-23.3S14.2,3.7,27.1,3.7s23.3,10.4,23.3,23.3-10.4,23.3-23.3,23.3Z"/>
          </svg>
          <div>
            <h1 className="text-base font-bold tracking-wide">CARA</h1>
            <p className="text-[10px] text-cara-300 leading-tight">IUPA</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-cara-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {visibleItems.map((item) => {
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cara-700 text-white'
                      : 'text-cara-300 hover:bg-cara-800 hover:text-white',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-cara-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { navigate('/mi-perfil'); setSidebarOpen(false); }}
              className="text-left hover:opacity-80 transition-opacity"
            >
              <p className="font-medium text-white">{user?.fullName}</p>
              <p className="text-cara-400 text-xs">{user?.role}</p>
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-cara-300 hover:bg-cara-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-cara-600">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-cara-900">CARA</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
