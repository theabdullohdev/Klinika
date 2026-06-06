import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Award, X } from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 8;

function Doctors({ doctors, departments, isAdmin, loading, setLoading, fetchDoctors, fetchDoctorStats, apiRequest, notify }) {
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorDeptFilter, setDoctorDeptFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState(null); // null | 'doctor_form'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [doctorInput, setDoctorInput] = useState({
    first_name: '', last_name: '', specialization: '', license_number: '', 
    phone: '', email: '', bio: '', department_id: '', is_available: true
  });

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      notify?.('error', 'Request jo\'natilmadi', 'Sizda shifokorlarni boshqarish huquqi yo\'q.');
      return;
    }
    
    setLoading(true);
    try {
      if (selectedDoctor) {
        await apiRequest('PUT', `/doctors/${selectedDoctor.id}`, doctorInput);
        notify?.('success', 'Request jo\'natildi', 'Shifokor profili yangilandi.');
      } else {
        await apiRequest('POST', '/doctors', doctorInput);
        notify?.('success', 'Request jo\'natildi', 'Yangi shifokor muvaffaqiyatli qo\'shildi.');
      }
      setActiveModal(null);
      fetchDoctors();
      fetchDoctorStats();
    } catch (err) {
      notify?.('error', 'Request jo\'natilmadi', err.message || 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const openDoctorEdit = (doc) => {
    if (!isAdmin) return;
    setSelectedDoctor(doc);
    setDoctorInput({
      first_name: doc.first_name,
      last_name: doc.last_name,
      specialization: doc.specialization,
      license_number: doc.license_number,
      phone: doc.phone || '',
      email: doc.email || '',
      bio: doc.bio || '',
      department_id: doc.department_id,
      is_available: doc.is_available
    });
    setActiveModal('doctor_form');
  };

  const handleDeleteDoctor = async (id) => {
    if (!isAdmin) return;
    if (!confirm('Haqiqatan ham bu shifokorni o\'chirishni xohlaysizmi? Tegishli yozuvlar saqlanadi.')) return;
    try {
      await apiRequest('DELETE', `/doctors/${id}`);
      notify?.('success', 'Request jo\'natildi', 'Shifokor o\'chirildi.');
      fetchDoctors();
      fetchDoctorStats();
    } catch (err) {
      notify?.('error', 'Request jo\'natilmadi', err.message || 'O\'chirishda xatolik yuz berdi.');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const fullName = `${doc.first_name} ${doc.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(doctorSearch.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesDept = doctorDeptFilter === '' || doc.department_id === doctorDeptFilter;
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDoctors = filteredDoctors.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  return (
    <>
      {/* Search Header Action inside page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexGrow: 1 }}>
          <div className="search-box">
            <Search className="search-box-icon" />
            <input 
              type="text" 
              placeholder="Shifokor ismi yoki mutaxassisligi bo'yicha..." 
              value={doctorSearch}
              onChange={(e) => {
                setDoctorSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select 
            className="filter-select"
            value={doctorDeptFilter}
            onChange={(e) => {
              setDoctorDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Barcha bo'limlar</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <button 
            className="btn btn-primary"
            style={{ marginLeft: '16px', flexShrink: 0 }}
            onClick={() => {
              setSelectedDoctor(null);
              setDoctorInput({
                first_name: '', last_name: '', specialization: '', license_number: '', 
                phone: '', email: '', bio: '', department_id: departments[0]?.id || '', is_available: true
              });
              setActiveModal('doctor_form');
            }}
          >
            <Plus size={16} />
            <span>Shifokor Qo'shish</span>
          </button>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="table-wrapper">
          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <Award className="empty-state-icon" />
              <h3>Hech qanday shifokor topilmadi</h3>
              <p>Qidiruv shartlariga mos keluvchi shifokorlar mavjud emas.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shifokor Profili</th>
                  <th>Litsenziya Raqami</th>
                  <th>Mutaxassislik</th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>Mavjudligi</th>
                  {isAdmin && <th>Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedDoctors.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div className="profile-cell">
                        <div className="profile-avatar">
                          {doc.first_name.charAt(0)}
                        </div>
                        <div>
                          <span className="profile-name">Dr. {doc.first_name} {doc.last_name}</span>
                          <div className="profile-subtext">Bo'lim ID: {doc.department_id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{doc.license_number}</td>
                    <td>{doc.specialization}</td>
                    <td>{doc.phone || 'Kiritilmagan'}</td>
                    <td>{doc.email || 'Kiritilmagan'}</td>
                    <td>
                      <span className={`badge ${doc.is_available ? 'badge-success' : 'badge-danger'}`}>
                        {doc.is_available ? 'Mavjud' : 'Mavjud emas'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="actions-cell">
                          <button className="btn-action edit" onClick={() => openDoctorEdit(doc)} title="Tahrirlash">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-action delete" onClick={() => handleDeleteDoctor(doc.id)} title="O'chirish">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          totalItems={filteredDoctors.length}
          currentPage={safeCurrentPage}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal: Doctor Form */}
      {activeModal === 'doctor_form' && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedDoctor ? 'Shifokor Profilini Tahrirlash' : 'Yangi Shifokor Qo\'shish'}</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDoctorSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ism</label>
                    <input 
                      type="text" 
                      value={doctorInput.first_name}
                      onChange={(e) => setDoctorInput({ ...doctorInput, first_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Familiya</label>
                    <input 
                      type="text" 
                      value={doctorInput.last_name}
                      onChange={(e) => setDoctorInput({ ...doctorInput, last_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Klinika Bo'limi</label>
                    <select 
                      value={doctorInput.department_id}
                      onChange={(e) => setDoctorInput({ ...doctorInput, department_id: e.target.value })}
                      required
                    >
                      <option value="">Bo'limni tanlang</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Mutaxassislik</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: Kardiolog, Terapevt"
                      value={doctorInput.specialization}
                      onChange={(e) => setDoctorInput({ ...doctorInput, specialization: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tibbiy Litsenziya Raqami</label>
                    <input 
                      type="text" 
                      placeholder="Litsenziya seriyasi va raqami"
                      value={doctorInput.license_number}
                      onChange={(e) => setDoctorInput({ ...doctorInput, license_number: e.target.value })}
                      required
                      disabled={!!selectedDoctor}
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefon</label>
                    <input 
                      type="text" 
                      placeholder="+998901234567"
                      value={doctorInput.phone}
                      onChange={(e) => setDoctorInput({ ...doctorInput, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Elektron Pochta (Email)</label>
                    <input 
                      type="email" 
                      placeholder="doctor@caretrack.uz"
                      value={doctorInput.email}
                      onChange={(e) => setDoctorInput({ ...doctorInput, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ish Mavjudligi</label>
                    <select 
                      value={doctorInput.is_available ? 'true' : 'false'}
                      onChange={(e) => setDoctorInput({ ...doctorInput, is_available: e.target.value === 'true' })}
                    >
                      <option value="true">Mavjud (Qabul qiladi)</option>
                      <option value="false">Mavjud Emas (Band)</option>
                    </select>
                  </div>

                  <div className="form-group form-full">
                    <label>Shifokor haqida ma'lumot (Bio)</label>
                    <textarea 
                      placeholder="Shifokor tajribasi, yutuqlari va qisqacha ma'lumot..."
                      value={doctorInput.bio}
                      onChange={(e) => setDoctorInput({ ...doctorInput, bio: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Bekor Qilish</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Doctors;
