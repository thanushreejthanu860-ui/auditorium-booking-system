import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

import { isAuthenticated, getAuth } from './utils/auth';
import Layout from './components/Layout';

import Login from './pages/Shared/Login';
import Dashboard from './pages/Shared/Dashboard';
import Calendar from './pages/Shared/Calendar';

import NewBooking from './pages/HOD/NewBooking';
import MyBookings from './pages/HOD/MyBookings';
import LEDUpload from './pages/HOD/LEDUpload';

import ReviewRequests from './pages/Admin/ReviewRequests';
import ManageUsers from './pages/Admin/ManageUsers';

import FinalApproval from './pages/Principal/FinalApproval';

import LEDDisplay from './pages/LEDDisplay';

function ProtectedLayout({ roles }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const { role } = getAuth();
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: 13 } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/display" element={<LEDDisplay />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
        </Route>

        <Route element={<ProtectedLayout roles={['HOD']} />}>
          <Route path="/bookings/new" element={<NewBooking />} />
          <Route path="/bookings/my" element={<MyBookings />} />
          <Route path="/bookings/:id/upload" element={<LEDUpload />} />
        </Route>

        <Route element={<ProtectedLayout roles={['Admin']} />}>
          <Route path="/admin/review" element={<ReviewRequests />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>

        <Route element={<ProtectedLayout roles={['Principal']} />}>
          <Route path="/principal/approvals" element={<FinalApproval />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
