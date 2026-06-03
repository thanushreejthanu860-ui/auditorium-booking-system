import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_IMG = 5 * 1024 * 1024;
const MAX_PDF = 10 * 1024 * 1024;

export default function LEDUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get('/api/bookings/my').then(r => {
      const b = r.data.find(x => String(x.id) === String(id));
      if (!b || b.status !== 'approved') {
        toast.error('Upload only allowed for approved bookings.');
        navigate('/bookings/my');
      } else {
        setBooking(b);
      }
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed.');
      return false;
    }
    const maxSize = f.type === 'application/pdf' ? MAX_PDF : MAX_IMG;
    if (f.size > maxSize) {
      toast.error(`File too large. Max ${f.type === 'application/pdf' ? '10MB' : '5MB'}.`);
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!validateFile(f)) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file.');
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post(`/api/bookings/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded successfully!');
      navigate('/bookings/my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="page-header">
        <div><h2>📤 Upload LED Content</h2><p>{booking?.event_name}</p></div>
        <button className="btn btn-outline" onClick={() => navigate('/bookings/my')}>← Back</button>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-body">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div style={{ fontSize: 40 }}>📁</div>
            <p><strong>Click to browse</strong> or drag &amp; drop</p>
            <p>JPG, PNG (max 5MB) · PDF (max 10MB)</p>
            <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          </div>

          {file && (
            <div className="file-info">
              <span>{file.type === 'application/pdf' ? '📄' : '🖼️'}</span>
              <span style={{ flex: 1 }}>{file.name}</span>
              <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 16 }}
                onClick={() => { setFile(null); setPreview(null); }}>✕</button>
            </div>
          )}

          {preview && (
            <div className="upload-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? <><span className="spinner-inline" /> Uploading...</> : '📤 Upload'}
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/bookings/my')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
