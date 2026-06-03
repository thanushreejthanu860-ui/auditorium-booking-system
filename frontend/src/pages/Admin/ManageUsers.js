import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

const ROLES = ['HOD', 'Admin', 'Principal'];
const EMPTY = { name: '', email: '', role: 'HOD', department: '' };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email.';
    if (!form.role) e.role = 'Role is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.post('/api/users', form);
      toast.success(`User "${form.name}" created! Default password: pass123`);
      setShowModal(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const ROLE_COLORS = { HOD: 'badge-pending-admin', Admin: 'badge-pending-principal', Principal: 'badge-approved' };

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="page-header">
        <div><h2>👥 Manage Users</h2><p>{users.length} total users</p></div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(EMPTY); setErrors({}); }}>
          ➕ Create User
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${ROLE_COLORS[u.role] || 'badge-pending-admin'}`}>{u.role}</span></td>
                  <td>{u.department || '—'}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {[
                  { k: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith' },
                  { k: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@college.edu' },
                  { k: 'department', label: 'Department', type: 'text', placeholder: 'Computer Science (optional)' },
                ].map(({ k, label, type, placeholder }) => (
                  <div className="form-group" key={k}>
                    <label className="form-label">{label} {k !== 'department' && <span className="required">*</span>}</label>
                    <input type={type} className={`form-control ${errors[k] ? 'error' : ''}`}
                      value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
                    {errors[k] && <div className="form-error">{errors[k]}</div>}
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Role <span className="required">*</span></label>
                  <select className={`form-control ${errors.role ? 'error' : ''}`}
                    value={form.role} onChange={e => set('role', e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.role && <div className="form-error">{errors.role}</div>}
                </div>
                <div style={{ background: 'var(--warning-bg)', border: '1px solid #fcd34d', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: 12, color: 'var(--warning)' }}>
                  ⚠️ Default password will be <strong>pass123</strong>. User should change it after first login.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner-inline" /> Creating...</> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
