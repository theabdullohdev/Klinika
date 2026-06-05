import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://klinika-1-rj8n.onrender.com/api';

function Login({ setToken, setUser }) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', role: 'clinician' });
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(
          authMode === 'login' 
            ? { email: authForm.email, password: authForm.password }
            : authForm
        )
      };

      const res = await fetch(`${API_BASE}/auth/${authMode}`, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xatolik yuz berdi');
      }

      if (authMode === 'login') {
        if (data.user.role !== 'admin' && data.user.role !== 'clinician' && data.user.role !== 'receptionist') {
          throw new Error('Kirish taqiqlangan! Noma\'lum foydalanuvchi roli.');
        }
        
        setToken(data.accessToken);
        setUser(data.user);
        
        // Save to storage
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        alert('Hisob yaratildi! Endi kirish bo\'limi orqali tizimga kiring.');
        setAuthMode('login');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Activity size={26} />
          </div>
          <h1 className="auth-title">CareTrack Clinic</h1>
          <p className="auth-subtitle">Tibbiy Yozuvlarni Boshqarish Tizimi</p>
        </div>

        {authError && <div className="auth-error">{authError}</div>}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {authMode === 'signup' && (
            <div className="auth-input-group">
              <label>Foydalanuvchi nomi</label>
              <input 
                type="text" 
                placeholder="doctor_ali" 
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <label>Elektron pochta (Email)</label>
            <input 
              type="email" 
              placeholder="doctor@caretrack.uz" 
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Parol</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
          </div>

          {authMode === 'signup' && (
            <div className="auth-input-group">
              <label>Ruxsat roli</label>
              <select 
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
              >
                <option value="clinician">Klinik Shifokor (Clinician)</option>
                <option value="receptionist">Qabulxona Xodimi (Receptionist)</option>
                <option value="admin">Administrator (Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Kutilmoqda...' : authMode === 'login' ? 'Tizimga Kirish' : 'Ro\'yxatdan O\'tish'}
          </button>
        </form>

        <div className="auth-switch">
          {authMode === 'login' ? (
            <>
              Hisobingiz yo'qmi?{' '}
              <span className="auth-switch-link" onClick={() => setAuthMode('signup')}>
                Ro'yxatdan o'tish
              </span>
            </>
          ) : (
            <>
              Hisobingiz bormi?{' '}
              <span className="auth-switch-link" onClick={() => setAuthMode('login')}>
                Kirish
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
