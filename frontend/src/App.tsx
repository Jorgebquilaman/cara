import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import DashboardPage from '@/features/dashboard/DashboardPage';
import AssetsPage from '@/features/assets/AssetsPage';
import AssetDetailPage from '@/features/assets/AssetDetailPage';
import LoansPage from '@/features/loans/LoansPage';
import MyLoansPage from '@/features/loans/MyLoansPage';
import OverdueLoansPage from '@/features/loans/OverdueLoansPage';
import ReservationsPage from '@/features/reservations/ReservationsPage';
import UsersPage from '@/features/users/UsersPage';
import ReportsPage from '@/features/reports/ReportsPage';
import NotificationsPage from '@/features/notifications/NotificationsPage';
import IncidentsPage from '@/features/incidents/IncidentsPage';
import SanctionsPage from '@/features/sanctions/SanctionsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import LoginPage from '@/features/users/LoginPage';
import ForgotPasswordPage from '@/features/users/ForgotPasswordPage';
import ResetPasswordPage from '@/features/users/ResetPasswordPage';
import AccountRequestFormPage from '@/features/users/AccountRequestPage';
import AccountRequestsPage from '@/features/users/AccountRequestsPage';
import EmailConfigPage from '@/features/settings/EmailConfigPage';
import DepartmentsPage from '@/features/settings/DepartmentsPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/solicitar-alta" element={<AccountRequestFormPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute roles={['Admin', 'Staff']}><AssetsPage /></ProtectedRoute>} />
        <Route path="/assets/:id" element={<ProtectedRoute><AssetDetailPage /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute roles={['Admin', 'Staff']}><LoansPage /></ProtectedRoute>} />
        <Route path="/loans/overdue" element={<ProtectedRoute roles={['Admin', 'Staff']}><OverdueLoansPage /></ProtectedRoute>} />
        <Route path="/my-loans" element={<ProtectedRoute><MyLoansPage /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['Admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="/departamentos" element={<ProtectedRoute roles={['Admin']}><DepartmentsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['Admin', 'Staff']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute roles={['Admin', 'Staff']}><IncidentsPage /></ProtectedRoute>} />
        <Route path="/sanctions" element={<ProtectedRoute roles={['Admin', 'Staff']}><SanctionsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/mi-perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/config-email" element={<ProtectedRoute roles={['Admin']}><EmailConfigPage /></ProtectedRoute>} />
        <Route path="/solicitudes-alta" element={<ProtectedRoute roles={['Admin']}><AccountRequestsPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
