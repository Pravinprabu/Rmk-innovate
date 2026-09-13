import { Navigate, Route, Routes } from 'react-router-dom';

import SuperAdminProtectedRoute from './super-admin/components/ProtectedRoute';
import SuperAdminLogin from './super-admin/pages/Login';
import SuperAdminDashboard from './super-admin/pages/Dashboard';
import SuperAdminAnalyticsPage from './super-admin/pages/AnalyticsPage';
import SuperAdminSystemConfigPage from './super-admin/pages/SystemConfigPage';
import SuperAdminProfilePage from './super-admin/pages/ProfilePage';

import HospitalAdminProtectedRoute from './hospital-admin/components/ProtectedRoute';
import HospitalAdminLogin from './hospital-admin/pages/Login';
import HospitalAdminDashboard from './hospital-admin/pages/Dashboard';
import HospitalAdminProfilePage from './hospital-admin/pages/ProfilePage';

import StaffProtectedRoute from './staff/components/ProtectedRoute';
import StaffLogin from './staff/pages/Login';
import DoctorQueuePage from './staff/pages/DoctorQueuePage';
import DoctorBookedPage from './staff/pages/DoctorBookedPage';
import DoctorProfilePage from './staff/pages/DoctorProfilePage';
import TriageQueuePage from './staff/pages/TriageQueuePage';
import TriageBookedPage from './staff/pages/TriageBookedPage';
import TriageEmergencyPage from './staff/pages/TriageEmergencyPage';
import TriageProfilePage from './staff/pages/TriageProfilePage';

// One app, one origin (port 3000), three role-scoped sections told apart by
// URL prefix -- /super-admin/*, /hospital-admin/*, /staff/* -- instead of
// three separate apps on three separate ports. Each section keeps its own
// api/client.js (own login endpoint, own namespaced localStorage keys) and
// its own ProtectedRoute, copied rather than shared, because the auth
// details genuinely differ per role; only the small presentational bits
// (components/ui.jsx, index.css) are shared.
//
// "/" renders the staff (doctor/triage) login directly -- that's the portal
// meant to be shown/demoed. Super-admin and hospital-admin have no landing
// link; reach them by typing their URL directly.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StaffLogin />} />

      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route
        path="/super-admin/dashboard"
        element={
          <SuperAdminProtectedRoute loginPath="/super-admin/login">
            <SuperAdminDashboard />
          </SuperAdminProtectedRoute>
        }
      />
      <Route
        path="/super-admin/analytics"
        element={
          <SuperAdminProtectedRoute loginPath="/super-admin/login">
            <SuperAdminAnalyticsPage />
          </SuperAdminProtectedRoute>
        }
      />
      <Route
        path="/super-admin/system-config"
        element={
          <SuperAdminProtectedRoute loginPath="/super-admin/login">
            <SuperAdminSystemConfigPage />
          </SuperAdminProtectedRoute>
        }
      />
      <Route
        path="/super-admin/profile"
        element={
          <SuperAdminProtectedRoute loginPath="/super-admin/login">
            <SuperAdminProfilePage />
          </SuperAdminProtectedRoute>
        }
      />

      <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
      <Route
        path="/hospital-admin/dashboard"
        element={
          <HospitalAdminProtectedRoute loginPath="/hospital-admin/login">
            <HospitalAdminDashboard />
          </HospitalAdminProtectedRoute>
        }
      />
      <Route
        path="/hospital-admin/profile"
        element={
          <HospitalAdminProtectedRoute loginPath="/hospital-admin/login">
            <HospitalAdminProfilePage />
          </HospitalAdminProtectedRoute>
        }
      />

      <Route path="/staff/login" element={<StaffLogin />} />
      <Route
        path="/staff/doctor"
        element={
          <StaffProtectedRoute role="doctor" loginPath="/staff/login">
            <DoctorQueuePage />
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/doctor/booked"
        element={
          <StaffProtectedRoute role="doctor" loginPath="/staff/login">
            <DoctorBookedPage />
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/doctor/profile"
        element={
          <StaffProtectedRoute role="doctor" loginPath="/staff/login">
            <DoctorProfilePage />
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/triage"
        element={
          <StaffProtectedRoute role="triage" loginPath="/staff/login">
            <TriageQueuePage />
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/triage/booked"
        element={
          <StaffProtectedRoute role="triage" loginPath="/staff/login">
            <TriageBookedPage />
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/triage/emergency"
        element={
          <StaffProtectedRoute role="triage" loginPath="/staff/login">
            <TriageEmergencyPage />
          </StaffProtectedRoute>
        }
      />
      <Route
        path="/staff/triage/profile"
        element={
          <StaffProtectedRoute role="triage" loginPath="/staff/login">
            <TriageProfilePage />
          </StaffProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
