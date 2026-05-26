import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { setAuth, isAuthenticated } from '../../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand-icon">🏛️</div>
          <h1 className="login-brand-title">Ratan Tata<br />Auditorium</h1>
          <p className="login-brand-sub">Booking & Event Support System</p>
          <div className="login-features">
            <div className="login-feature-item">✦ Seamless booking management</div>
            <div className="login-feature-item">✦ Multi-level approval workflow</div>
            <div className="login-feature-item">✦ Real-time notifications</div>
            <div className="login-feature-item">✦ LED display integration</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉</span>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" className="login-eye-btn" onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <><span className="spinner-inline" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <p className="login-footer-note">Contact your administrator to get access.</p>
        </div>
      </div>
    </div>
  );
}
