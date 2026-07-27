import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { TadbirkorLayout } from './layouts/TadbirkorLayout';
import { useAuthStore } from './store/authStore';

import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminRegionsMap } from './pages/admin/RegionsMap';
import { AdminMonitoring } from './pages/admin/Monitoring';
import { AdminApplications } from './pages/admin/Applications';
import { AdminApplicationDetail } from './pages/admin/ApplicationDetail';
import { AdminContracts } from './pages/admin/Contracts';
import { AdminPayments } from './pages/admin/Payments';
import { AdminReports } from './pages/admin/Reports';
import { AdminUsers } from './pages/admin/Users';
import { AdminReferences } from './pages/admin/References';
import { AdminSettings } from './pages/admin/Settings';

import { TadbirkorDashboard } from './pages/tadbirkor/Dashboard';
import { TadbirkorMyRegions } from './pages/tadbirkor/MyRegions';
import { TadbirkorMyApplications } from './pages/tadbirkor/MyApplications';
import { TadbirkorNewApplication } from './pages/tadbirkor/NewApplication';
import { TadbirkorApplicationDetail } from './pages/tadbirkor/ApplicationDetail';
import { TadbirkorMyContracts } from './pages/tadbirkor/MyContracts';
import { TadbirkorMyPayments } from './pages/tadbirkor/MyPayments';
import { TadbirkorNotifications } from './pages/tadbirkor/Notifications';
import { TadbirkorRequests } from './pages/tadbirkor/Requests';
import { TadbirkorDocuments } from './pages/tadbirkor/Documents';

const STAFF_ROLES = ['KADASTR', 'ARXITEKTURA', 'SOLIQ'];

function AdminIndex() {
  const role = useAuthStore((s) => s.user?.role);
  if (role && STAFF_ROLES.includes(role)) {
    return <Navigate to="/admin/arizalar" replace />;
  }
  return <AdminDashboard />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute roles={['SUPER_ADMIN', 'KADASTR', 'ARXITEKTURA', 'SOLIQ']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminIndex /> },
          { path: 'hududlar', element: <AdminRegionsMap /> },
          { path: 'monitoring', element: <AdminMonitoring /> },
          { path: 'arizalar', element: <AdminApplications /> },
          { path: 'arizalar/:id', element: <AdminApplicationDetail /> },
          { path: 'shartnomalar', element: <AdminContracts /> },
          { path: 'tolovlar', element: <AdminPayments /> },
          { path: 'hisobotlar', element: <AdminReports /> },
          { path: 'foydalanuvchilar', element: <AdminUsers /> },
          { path: 'malumotnomalar', element: <AdminReferences /> },
          { path: 'sozlamalar', element: <AdminSettings /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['TADBIRKOR']} />,
    children: [
      {
        path: '/tadbirkor',
        element: <TadbirkorLayout />,
        children: [
          { index: true, element: <TadbirkorDashboard /> },
          { path: 'hududlarim', element: <TadbirkorMyRegions /> },
          { path: 'arizalarim', element: <TadbirkorMyApplications /> },
          { path: 'arizalarim/yangi', element: <TadbirkorNewApplication /> },
          { path: 'arizalarim/:id', element: <TadbirkorApplicationDetail /> },
          { path: 'shartnomalarim', element: <TadbirkorMyContracts /> },
          { path: 'tolovlarim', element: <TadbirkorMyPayments /> },
          { path: 'xabarnomalar', element: <TadbirkorNotifications /> },
          { path: 'murojaatlarim', element: <TadbirkorRequests /> },
          { path: 'hujjatlarim', element: <TadbirkorDocuments /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
