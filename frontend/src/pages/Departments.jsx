import { useState } from 'react';
import { Plus, X } from 'lucide-react';

function Departments({ departments, isAdmin, loading, setLoading, fetchDepartments, apiRequest, notify }) {
  const [activeModal, setActiveModal] = useState(null); // null | 'dept_form'
  const [deptInput, setDeptInput] = useState({ name: '', description: '' });

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    try {
      await apiRequest('POST', '/departments', deptInput);
      notify?.('success', 'Request jo\'natildi', 'Yangi bo\'lim yaratildi.');
      setActiveModal(null);
      fetchDepartments();
    } catch (err) {
      notify?.('error', 'Request jo\'natilmadi', err.message || 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDept = async (id) => {
    if (!isAdmin) return;
    if (!confirm('Haqiqatan ham bu bo\'limni o\'chirmoqchimisiz? (Soft-deactivate)')) return;
    try {
      await apiRequest('DELETE', `/departments/${id}`);
      notify?.('success', 'Request jo\'natildi', 'Bo\'lim faolsizlantirildi.');
      fetchDepartments();
    } catch (err) {
      notify?.('error', 'Request jo\'natilmadi', err.message || 'Xatolik yuz berdi.');
    }
  };

  return (
    <>
      {/* Header action inside page */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        {isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              setDeptInput({ name: '', description: '' });
              setActiveModal('dept_form');
            }}
          >
            <Plus size={16} />
            <span>Yangi Bo'lim Yaratish</span>
          </button>
        )}
      </div>

      <div className="dept-grid">
        {departments.map(dept => (
          <div className="dept-card" key={dept.id}>
            <div className="dept-card-header">
              <div className="dept-card-title">{dept.name}</div>
              <span className={`badge ${dept.is_active ? 'badge-success' : 'badge-danger'}`}>
                {dept.is_active ? 'Faol bo\'lim' : 'Faolsiz'}
              </span>
            </div>
            <div className="dept-card-desc">
              {dept.description || 'Ushbu tibbiy bo\'lim uchun tavsif kiritilmagan.'}
            </div>
            {dept.is_active && isAdmin && (
              <div className="dept-card-footer">
                <button className="btn btn-secondary btn-danger" onClick={() => handleDeactivateDept(dept.id)}>
                  Bo'limni O'chirish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Create Department */}
      {activeModal === 'dept_form' && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yangi Bo'lim Yaratish</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDeptSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Bo'lim Nomi</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: Nevrologiya, Kardiologiya..."
                      value={deptInput.name}
                      onChange={(e) => setDeptInput({ ...deptInput, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Tavsif (Description)</label>
                    <textarea 
                      placeholder="Bo'limning vazifalari, ko'rsatadigan xizmatlari haqida..."
                      value={deptInput.description}
                      onChange={(e) => setDeptInput({ ...deptInput, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Bekor Qilish</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Departments;
