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
    <div style={s.page}>

      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={s.leftBg} />
        <div style={s.leftContent}>
          <div style={s.brand}>
            <span style={s.brandIcon}>🏛️</span>
            <span style={s.brandName}>AudiBook</span>
          </div>
          <h1 style={s.leftHeading}>Manage your<br />auditorium<br />bookings.</h1>
          <p style={s.leftDesc}>
            A streamlined platform for HODs, Admins, and the Principal to request, review, and approve auditorium events.
          </p>
          <div style={s.dots}>
            {[0,1,2].map(i => <span key={i} style={{ ...s.dot, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }} />)}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.formBox}>
          <h2 style={s.formTitle}>Sign in</h2>
          <p style={s.formSub}>Enter your credentials to access the system</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input
                type="email"
                placeholder="you@college.edu"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoFocus
                style={s.input}
                onFocus={e => Object.assign(e.target.style, s.inputFocus)}
                onBlur={e => Object.assign(e.target.style, { borderColor: '#e5e7eb', boxShadow: 'none' })}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.passWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...s.input, paddingRight: 44 }}
                  onFocus={e => Object.assign(e.target.style, s.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#e5e7eb', boxShadow: 'none', paddingRight: '44px' })}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" style={s.submitBtn} disabled={loading}
              onMouseEnter={e => !loading && Object.assign(e.target.style, s.submitHover)}
              onMouseLeave={e => Object.assign(e.target.style, { background: '#111827', transform: 'none' })}
            >
              {loading ? <><span className="spinner-inline" /> Signing in...</> : 'Sign in →'}
            </button>
          </form>

          <p style={s.note}>Contact your administrator to get access.</p>
        </div>
      </div>

    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  left: {
    width: '48%',
    backgroundImage: 'url(https://i.pinimg.com/736x/08/35/9c/08359c52a0f863eff111e8aaf10e1677.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 56px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftBg: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    pointerEvents: 'none',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 380,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 56,
  },
  brandIcon: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  leftHeading: {
    fontSize: 44,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.15,
    letterSpacing: '-1.5px',
    marginBottom: 20,
  },
  leftDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7,
    marginBottom: 48,
    fontWeight: 400,
  },
  dots: {
    display: 'flex',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    padding: '48px 40px',
  },
  formBox: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 20,
    padding: '44px 40px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
    border: '1px solid #e5e7eb',
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#111827',
    marginBottom: 6,
    letterSpacing: '-0.6px',
  },
  formSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 32,
    fontWeight: 400,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#111827',
    boxShadow: '0 0 0 3px rgba(17,24,39,0.08)',
    background: '#fff',
  },
  passWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    color: '#9ca3af',
    padding: 4,
    lineHeight: 1,
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    letterSpacing: '-0.2px',
  },
  submitHover: {
    background: '#1f2937',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },
  note: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    color: '#9ca3af',
  },
};
