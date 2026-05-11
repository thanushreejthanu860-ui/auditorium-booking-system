import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

import ProtectedRoute from './components/ProtectedRoute';
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

function WithLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: 13 } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/display" element={<LEDDisplay />} />

        <Route path="/dashboard" element={<WithLayout><Dashboard /></WithLayout>} />
        <Route path="/calendar" element={<WithLayout><Calendar /></WithLayout>} />

        {/* HOD */}
        <Route path="/bookings/new" element={<WithLayout><ProtectedRoute roles={['HOD']}><NewBooking /></ProtectedRoute></WithLayout>} />
        <Route path="/bookings/my" element={<WithLayout><ProtectedRoute roles={['HOD']}><MyBookings /></ProtectedRoute></WithLayout>} />
        <Route path="/bookings/:id/upload" element={<WithLayout><ProtectedRoute roles={['HOD']}><LEDUpload /></ProtectedRoute></WithLayout>} />

        {/* Admin */}
        <Route path="/admin/review" element={<WithLayout><ProtectedRoute roles={['Admin']}><ReviewRequests /></ProtectedRoute></WithLayout>} />
        <Route path="/admin/users" element={<WithLayout><ProtectedRoute roles={['Admin']}><ManageUsers /></ProtectedRoute></WithLayout>} />

        {/* Principal */}
        <Route path="/principal/approvals" element={<WithLayout><ProtectedRoute roles={['Principal']}><FinalApproval /></ProtectedRoute></WithLayout>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
