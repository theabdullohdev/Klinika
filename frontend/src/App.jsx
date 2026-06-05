import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Activity, Award, UserRound, FolderHeart, LogOut, Sun, Moon, 
  BarChart2
} from 'lucide-react';

// Subpages and Auth guards
import Login from './pages/Login';
import Overview from './pages/Overview';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Diagnoses from './pages/Diagnoses';
import Departments from './pages/Departments';
import ProtectedRoute from './components/ProtectedRoute';

// Read API URL from environment variables, fallback to localhost:5000
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function App() {
  const navigate = useNavigate();

  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // App Layout State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [loading, setLoading] = useState(false);

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [doctorStats, setDoctorStats] = useState([]);
  const [patients, setPatients] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Role helper variables
  const isAdmin = user?.role === 'admin';
  const isClinician = user?.role === 'clinician';
  const isReceptionist = user?.role === 'receptionist';

  // Init theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch all data when token is active
  useEffect(() => {
    if (token && (isAdmin || isClinician || isReceptionist)) {
      fetchDepartments();
      fetchDoctors();
      fetchPatients();
      fetchDoctorStats();
      
      // Receptionist has NO RLS permissions for diagnoses table, skip fetch to prevent auth exceptions
      if (!isReceptionist) {
        fetchDiagnoses();
      }
    }
  }, [token, user]);

  // Helper fetch request
  const apiRequest = async (method, path, body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const options = { method, headers };
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const res = await fetch(`${API_BASE}${path}`, options);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (err) {
      console.error(`API Error ${path}:`, err.message);
      if (err.message.includes('No token') || err.message.includes('expired token')) {
        handleLogout();
      }
      throw err;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch functions
  const fetchDepartments = async () => {
    try {
      const data = await apiRequest('GET', '/departments');
      setDepartments(data);
    } catch (e) {}
  };

  const fetchDoctors = async () => {
    try {
      const data = await apiRequest('GET', '/doctors');
      setDoctors(data);
    } catch (e) {}
  };

  const fetchDoctorStats = async () => {
    try {
      const data = await apiRequest('GET', '/doctors/stats');
      setDoctorStats(data);
    } catch (e) {}
  };

  const fetchPatients = async () => {
    try {
      const data = await apiRequest('GET', '/patients');
      setPatients(data);
    } catch (e) {}
  };

  const fetchDiagnoses = async () => {
    try {
      const data = await apiRequest('GET', '/diagnoses');
      setDiagnoses(data);
    } catch (e) {}
  };

  // Layout wrapper with Header, Sidebar, and Nested Page Outlet
  const DashboardLayout = () => {
    return (
      <div className="app-wrapper">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Activity size={22} />
            </div>
            <span className="sidebar-title">CareTrack</span>
          </div>

          <nav className="sidebar-menu">
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            >
              <BarChart2 className="menu-item-icon" />
              <span>Umumiy Ko'rinish</span>
            </NavLink>

            <NavLink 
              to="/dashboard/doctors" 
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            >
              <Award className="menu-item-icon" />
              <span>Shifokorlar</span>
            </NavLink>

            <NavLink 
              to="/dashboard/patients" 
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            >
              <UserRound className="menu-item-icon" />
              <span>Bemorlar</span>
            </NavLink>

            {/* Disease records are completely hidden from Receptionists */}
            {!isReceptionist && (
              <NavLink 
                to="/dashboard/diagnoses" 
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              >
                <FolderHeart className="menu-item-icon" />
                <span>Kasalliklar</span>
              </NavLink>
            )}

            <NavLink 
              to="/dashboard/departments" 
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            >
              <Activity className="menu-item-icon" />
              <span>Bo'limlar</span>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div 
                className="user-avatar" 
                style={{ 
                  backgroundColor: isReceptionist ? 'var(--color-warning-light)' : (isClinician ? 'var(--color-primary-light)' : '#cbd5e1'), 
                  color: isReceptionist ? 'var(--color-warning)' : (isClinician ? 'var(--color-primary)' : '#1e293b') 
                }}
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.username}</div>
                <div 
                  className="user-role" 
                  style={{ color: isReceptionist ? 'var(--color-warning)' : (isClinician ? 'var(--color-primary)' : 'var(--color-success)') }}
                >
                  {user?.role === 'receptionist' ? 'Receptionist' : user?.role}
                </div>
              </div>
              <button className="btn-action" onClick={handleLogout} title="Chiqish">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Panel Content Container */}
        <main className="main-panel">
          
          {/* Header */}
          <header className="panel-header">
            <div className="header-title-area">
              <Routes>
                <Route path="" element={
                  <>
                    <h1>Klinika Monitori</h1>
                    <p>Klinikadagi faollik, shifokorlar va bemorlarning umumiy statistikasi</p>
                  </>
                } />
                <Route path="doctors" element={
                  <>
                    <h1>Shifokor Profillari</h1>
                    <p>Shifokorlar profillari va qabul jadvallari</p>
                  </>
                } />
                <Route path="patients" element={
                  <>
                    <h1>Bemorlar Ma'lumotlari</h1>
                    <p>Ro'yxatga olingan bemorlar ro'yxati va to'liq tibbiy profillar</p>
                  </>
                } />
                <Route path="diagnoses" element={
                  !isReceptionist ? (
                    <>
                      <h1>Kasalliklar Jurnali</h1>
                      <p>Kasallik yozuvlarini shifokor va kategoriya bo'yicha kiritish hamda o'zgartirish</p>
                    </>
                  ) : <Navigate to="/dashboard" replace />
                } />
                <Route path="departments" element={
                  <>
                    <h1>Klinika Bo'limlari</h1>
                    <p>Klinikaning faol tibbiy bo'limlari ro'yxati</p>
                  </>
                } />
              </Routes>
            </div>
            
            <div className="header-actions">
              <button 
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Mavzuni o'zgartirish"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>

          {/* Render Nested Page Views */}
          <Outlet />

        </main>
      </div>
    );
  };

  return (
    <Routes>
      {/* Public auth route */}
      <Route 
        path="/login" 
        element={
          token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} setUser={setUser} />
        } 
      />

      {/* Protected dashboard pages container */}
      <Route path="/dashboard" element={<ProtectedRoute token={token} />}>
        <Route element={<DashboardLayout />}>
          <Route 
            index 
            element={
              <Overview 
                patients={patients}
                doctors={doctors}
                diagnoses={diagnoses}
                departments={departments}
                doctorStats={doctorStats}
              />
            } 
          />
          <Route 
            path="doctors" 
            element={
              <Doctors 
                doctors={doctors}
                departments={departments}
                isAdmin={isAdmin}
                loading={loading}
                setLoading={setLoading}
                fetchDoctors={fetchDoctors}
                fetchDoctorStats={fetchDoctorStats}
                apiRequest={apiRequest}
              />
            } 
          />
          <Route 
            path="patients" 
            element={
              <Patients 
                patients={patients}
                doctors={doctors}
                isAdmin={isAdmin}
                isClinician={isClinician}
                isReceptionist={isReceptionist}
                loading={loading}
                setLoading={setLoading}
                fetchPatients={fetchPatients}
                apiRequest={apiRequest}
              />
            } 
          />
          <Route 
            path="diagnoses" 
            element={
              isReceptionist ? <Navigate to="/dashboard" replace /> : (
                <Diagnoses 
                  diagnoses={diagnoses}
                  doctors={doctors}
                  isAdmin={isAdmin}
                  loading={loading}
                  setLoading={setLoading}
                  fetchDiagnoses={fetchDiagnoses}
                  apiRequest={apiRequest}
                />
              )
            } 
          />
          <Route 
            path="departments" 
            element={
              <Departments 
                departments={departments}
                isAdmin={isAdmin}
                loading={loading}
                setLoading={setLoading}
                fetchDepartments={fetchDepartments}
                apiRequest={apiRequest}
              />
            } 
          />
        </Route>
      </Route>

      {/* Wildcard fallback redirection */}
      <Route 
        path="*" 
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;
