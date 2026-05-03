import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServiceRegistryPage from './pages/ServiceRegistryPage';
import DependencyMapPage from './pages/DependencyMapPage';
import ChangeRequestsPage from './pages/ChangeRequestsPage';
import CreateChangeRequestPage from './pages/CreateChangeRequestPage';
import ChangeRequestDetailPage from './pages/ChangeRequestDetailPage';
import ImpactReportPage from './pages/ImpactReportPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/services" element={<ServiceRegistryPage />} />
              <Route path="/dependencies" element={<DependencyMapPage />} />
              <Route path="/changes" element={<ChangeRequestsPage />} />
              <Route path="/changes/new" element={<CreateChangeRequestPage />} />
              <Route path="/changes/:id" element={<ChangeRequestDetailPage />} />
              <Route path="/impact/:id" element={<ImpactReportPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/review" element={<ReviewQueuePage />} />
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminSettingsPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
