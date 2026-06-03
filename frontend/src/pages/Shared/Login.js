import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import api from '../../utils/api';
import { setAuth, isAuthenticated } from '../../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Email and password are required.');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      setAuth(data);
      toast.success(`Welcome, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏛️</div>
          <h1>Ratan Tata Auditorium</h1>
          <p>Booking & Event Support System</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input
              type="email"
              className="form-control"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <><span className="spinner-inline" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p className="login-footer-text">
          Contact your administrator to get access.
        </p>
      </div>
    </div>
  );
}
