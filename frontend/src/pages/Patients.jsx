import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, UserRound, X, Heart, AlertCircle } from 'lucide-react';

const diseaseCategories = [
  { code: 'A00', label: 'Yuqumli va parazitar kasalliklar (A00-B99)' },
  { code: 'C00', label: 'Osmalar / onkologik kasalliklar (C00-D49)' },
  { code: 'E00', label: 'Endokrin va metabolik kasalliklar (E00-E89)' },
  { code: 'F00', label: 'Ruhiy va xulq-atvor buzilishlari (F00-F99)' },
  { code: 'G00', label: 'Asab tizimi kasalliklari (G00-G99)' },
  { code: 'I00', label: 'Yurak-qon tomir kasalliklari (I00-I99)' },
  { code: 'J00', label: 'Nafas olish tizimi kasalliklari (J00-J99)' },
  { code: 'K00', label: 'Ovqat hazm qilish tizimi kasalliklari (K00-K95)' },
  { code: 'M00', label: 'Mushak-skelet tizimi kasalliklari (M00-M99)' },
  { code: 'N00', label: 'Siydik-tanosil tizimi kasalliklari (N00-N99)' },
  { code: 'R00', label: 'Belgilar va laborator topilmalar (R00-R99)' },
  { code: 'S00', label: 'Jarohatlar va zaharlanishlar (S00-T88)' }
];

function Patients({ patients, doctors, isAdmin, isClinician, isReceptionist, loading, setLoading, fetchPatients, apiRequest }) {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientDocFilter, setPatientDocFilter] = useState('');
  
  const [activeModal, setActiveModal] = useState(null); // null | 'patient_form' | 'patient_profile' | 'diagnosis_form'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientFullProfile, setPatientFullProfile] = useState(null);

  const [patientInput, setPatientInput] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: 'male', 
    blood_type: 'unknown', phone: '', email: '', address: '', 
    emergency_contact: '', notes: '', doctor_id: ''
  });

  const [diagnosisInput, setDiagnosisInput] = useState({
    patient_id: '', doctor_id: '', icd_code: '', description: '', 
    severity: 'mild', status: 'active', notes: '', diagnosed_at: new Date().toISOString().split('T')[0]
  });

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedPatient) {
        if (isClinician) {
          // Clinician only edits the clinical notes textarea
          await apiRequest('PUT', `/patients/${selectedPatient.id}`, {
            notes: patientInput.notes
          });
          alert('Bemorning shifokor eslatmalari yangilandi!');
        } else if (isReceptionist) {
          // Receptionist edits demographic details, skip notes update
          const formattedInput = { ...patientInput };
          if (!formattedInput.doctor_id) delete formattedInput.doctor_id;
          delete formattedInput.notes; // Skip clinical notes to comply with RLS permissions
          
          await apiRequest('PUT', `/patients/${selectedPatient.id}`, formattedInput);
          alert('Bemor ma\'muriy ma\'lumotlari yangilandi!');
        } else {
          // Admin can edit all fields
          const formattedInput = { ...patientInput };
          if (!formattedInput.doctor_id) delete formattedInput.doctor_id;
          await apiRequest('PUT', `/patients/${selectedPatient.id}`, formattedInput);
          alert('Bemor yozuvi to\'liq yangilandi!');
        }
      } else {
        // Clinicians, Admins, and Receptionists can register patients
        
        const formattedInput = { ...patientInput };
        if (!formattedInput.doctor_id) delete formattedInput.doctor_id;
        
        // Skip notes if registered by a receptionist (since they are demographic registers)
        if (isReceptionist) {
          delete formattedInput.notes;
        }

        await apiRequest('POST', '/patients', formattedInput);
        alert('Yangi bemor muvaffaqiyatli ro\'yxatga olindi!');
      }
      setActiveModal(null);
      fetchPatients();
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const openPatientEdit = (p) => {
    setSelectedPatient(p);
    setPatientInput({
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth.split('T')[0],
      gender: p.gender,
      blood_type: p.blood_type,
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      emergency_contact: p.emergency_contact || '',
      notes: p.notes || '',
      doctor_id: p.doctor_id || ''
    });
    setActiveModal('patient_form');
  };

  const viewPatientProfile = async (p) => {
    if (isReceptionist) return; // Block view dossier for receptionists
    setSelectedPatient(p);
    try {
      const data = await apiRequest('GET', `/patients/${p.id}/full-profile`);
      setPatientFullProfile(data);
      setActiveModal('patient_profile');
    } catch {
      alert('Tizimdan to\'liq profil olishda xatolik yuz berdi.');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!isAdmin) return alert('Faqat admin bemorlarni o\'chirib tashlay oladi.');
    if (!confirm('Haqiqatan ham ushbu bemorning barcha tarixini tizimdan butunlay o\'chirib tashlamoqchimisiz?')) return;
    try {
      await apiRequest('DELETE', `/patients/${id}`);
      alert('Bemor yozuvi butunlay o\'chirildi!');
      fetchPatients();
    } catch (err) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    }
  };

  const handleTimelineDiagnosisSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisInput.icd_code) {
      alert('Kasallik kategoriyasini tanlang.');
      return;
    }

    setLoading(true);
    try {
      const formattedInput = { ...diagnosisInput };
      if (!formattedInput.doctor_id) delete formattedInput.doctor_id;

      await apiRequest('POST', '/diagnoses', formattedInput);
      alert('Yangi kasallik muvaffaqiyatli kiritildi!');
      setActiveModal('patient_profile');
      
      if (selectedPatient) {
        viewPatientProfile(selectedPatient);
      }
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(patientSearch.toLowerCase());
    const matchesDoc = patientDocFilter === '' || p.doctor_id === patientDocFilter;
    return matchesSearch && matchesDoc;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexGrow: 1 }}>
          <div className="search-box">
            <Search className="search-box-icon" />
            <input 
              type="text" 
              placeholder="Bemor ismi bo'yicha qidirish..." 
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={patientDocFilter}
            onChange={(e) => setPatientDocFilter(e.target.value)}
          >
            <option value="">Barcha shifokorlar</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
            ))}
          </select>
        </div>

        {(isAdmin || isReceptionist || isClinician) && (
          <button 
            className="btn btn-primary"
            style={{ marginLeft: '16px', flexShrink: 0 }}
            onClick={() => {
              setSelectedPatient(null);
              setPatientInput({
                first_name: '', last_name: '', date_of_birth: '', gender: 'male', 
                blood_type: 'unknown', phone: '', email: '', address: '', 
                emergency_contact: '', notes: '', doctor_id: doctors[0]?.id || ''
              });
              setActiveModal('patient_form');
            }}
          >
            <Plus size={16} />
            <span>Bemor Ro'yxatga Olish</span>
          </button>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="table-wrapper">
          {filteredPatients.length === 0 ? (
            <div className="empty-state">
              <UserRound className="empty-state-icon" />
              <h3>Hech qanday bemor topilmadi</h3>
              <p>Qidiruv shartlariga mos keluvchi bemorlar ma'lumotlar bazasida yo'q.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bemor Ismi</th>
                  <th>Tug'ilgan kuni</th>
                  <th>Jinsi</th>
                  <th>Qon guruhi</th>
                  <th>Telefon</th>
                  <th>Favqulodda Aloqa</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="profile-cell">
                        <div className="profile-avatar" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                          {p.first_name.charAt(0)}
                        </div>
                        <div>
                          <span className="profile-name">{p.first_name} {p.last_name}</span>
                          <div className="profile-subtext">Shifokor ID: {p.doctor_id ? p.doctor_id.substring(0,8) : 'Biriktirilmagan'}...</div>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(p.date_of_birth).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span className={`badge ${p.gender === 'male' ? 'badge-primary' : p.gender === 'female' ? 'badge-success' : 'badge-warning'}`}>
                        {p.gender === 'male' ? 'Erkak' : p.gender === 'female' ? 'Ayol' : 'Boshqa'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      <span className="badge badge-warning">{p.blood_type}</span>
                    </td>
                    <td>{p.phone || 'Kiritilmagan'}</td>
                    <td>{p.emergency_contact || 'Kiritilmagan'}</td>
                    <td>
                      <div className="actions-cell">
                        {/* Eye icon for confidential timeline is completely hidden for Receptionists */}
                        {!isReceptionist && (
                          <button className="btn-action view" onClick={() => viewPatientProfile(p)} title="Bemor To'liq Profili">
                            <Eye size={16} />
                          </button>
                        )}
                        <button className="btn-action edit" onClick={() => openPatientEdit(p)} title={isClinician ? "Tibbiy eslatmani tahrirlash" : "Tahrirlash"}>
                          <Edit2 size={16} />
                        </button>
                        {isAdmin && (
                          <button className="btn-action delete" onClick={() => handleDeletePatient(p.id)} title="Butunlay o'chirish">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal 1: Patient form */}
      {activeModal === 'patient_form' && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>
                {selectedPatient 
                  ? (isClinician ? 'Tibbiy Eslatma va Anamnez Kiritish' : (isReceptionist ? 'Bemor Ma\'muriy Ma\'lumotlarini Tahrirlash' : 'Bemor Yozuvini Tahrirlash')) 
                  : 'Yangi Bemor Ro\'yxatga Olish'}
              </h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePatientSubmit}>
              <div className="modal-body">
                {isClinician && selectedPatient && (
                  <div className="auth-error" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', color: 'var(--text-heading)', marginBottom: '16px', textAlign: 'left' }}>
                    <strong>💡 Shifokor Eslatmasi:</strong> Klinik rolingiz sababli sizga bemorning shaxsiy ma'lumotlarini (Ism, Telefon, Manzil) o'zgartirish cheklangan. Bemorning faqat <strong>Tibbiy Eslatmalar</strong> va anamnez ma'lumotlarini tahrirlashingiz mumkin.
                  </div>
                )}

                {isReceptionist && selectedPatient && (
                  <div className="auth-error" style={{ backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', color: 'var(--text-heading)', marginBottom: '16px', textAlign: 'left' }}>
                    <strong>💡 Qabulxona Eslatmasi:</strong> Bemorning pasport, telefon va ro'yxatga olish ma'lumotlarini to'liq tahrirlashingiz mumkin. Klinik kasallik yozuvlari va shifokor eslatmalarini yozish faqat shifokorlarga tegishli.
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Ism</label>
                    <input 
                      type="text" 
                      value={patientInput.first_name}
                      onChange={(e) => setPatientInput({ ...patientInput, first_name: e.target.value })}
                      required
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label>Familiya</label>
                    <input 
                      type="text" 
                      value={patientInput.last_name}
                      onChange={(e) => setPatientInput({ ...patientInput, last_name: e.target.value })}
                      required
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tug'ilgan Sana</label>
                    <input 
                      type="date" 
                      value={patientInput.date_of_birth}
                      onChange={(e) => setPatientInput({ ...patientInput, date_of_birth: e.target.value })}
                      required
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label>Jinsi</label>
                    <select 
                      value={patientInput.gender}
                      onChange={(e) => setPatientInput({ ...patientInput, gender: e.target.value })}
                      required
                      disabled={isClinician && selectedPatient}
                    >
                      <option value="male">Erkak</option>
                      <option value="female">Ayol</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Qon Guruhi</label>
                    <select 
                      value={patientInput.blood_type}
                      onChange={(e) => setPatientInput({ ...patientInput, blood_type: e.target.value })}
                      disabled={isClinician && selectedPatient}
                    >
                      <option value="unknown">Noma'lum</option>
                      <option value="A+">A+ (II guruh)</option>
                      <option value="A-">A- (II guruh)</option>
                      <option value="B+">B+ (III guruh)</option>
                      <option value="B-">B- (III guruh)</option>
                      <option value="AB+">AB+ (IV guruh)</option>
                      <option value="AB-">AB- (IV guruh)</option>
                      <option value="O+">O+ (I guruh)</option>
                      <option value="O-">O- (I guruh)</option>
                    </select>
                  </div>

                  <div className="form-group form-span-2">
                    <label>Biriktirilgan Shifokor</label>
                    <select 
                      value={patientInput.doctor_id}
                      onChange={(e) => setPatientInput({ ...patientInput, doctor_id: e.target.value })}
                      disabled={isClinician && selectedPatient}
                    >
                      <option value="">Shifokor biriktirilmasin</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Telefon Raqami</label>
                    <input 
                      type="text" 
                      placeholder="+998909876543"
                      value={patientInput.phone}
                      onChange={(e) => setPatientInput({ ...patientInput, phone: e.target.value })}
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  <div className="form-group">
                    <label>Elektron Pochta (Email)</label>
                    <input 
                      type="email" 
                      placeholder="patient@gmail.com"
                      value={patientInput.email}
                      onChange={(e) => setPatientInput({ ...patientInput, email: e.target.value })}
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Yashash Manzili</label>
                    <input 
                      type="text" 
                      placeholder="Toshkent sh., Yunusobod tumani..."
                      value={patientInput.address}
                      onChange={(e) => setPatientInput({ ...patientInput, address: e.target.value })}
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Favqulodda Aloqa</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe (Ayoli) +998909998877"
                      value={patientInput.emergency_contact}
                      onChange={(e) => setPatientInput({ ...patientInput, emergency_contact: e.target.value })}
                      disabled={isClinician && selectedPatient}
                    />
                  </div>

                  {/* Notes textarea is completely hidden for Receptionists */}
                  {!isReceptionist && (
                    <div className="form-group form-full">
                      <label>Tibbiy Eslatmalar & Retseptlar (Shifokor kiritmasi)</label>
                      <textarea 
                        placeholder="Allergiya, surunkali kasalliklar, anamnez va dori tavsiyalari..."
                        value={patientInput.notes}
                        onChange={(e) => setPatientInput({ ...patientInput, notes: e.target.value })}
                        required={isClinician}
                        style={{ border: isClinician ? '2px solid var(--color-primary)' : '1px solid var(--border-color)' }}
                      />
                    </div>
                  )}
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

      {/* Modal 2: Patient Full Profile timeline dossier */}
      {activeModal === 'patient_profile' && patientFullProfile && !isReceptionist && (
        <div className="modal-overlay">
          <div className="modal-content large" style={{ minHeight: '600px' }}>
            <div className="modal-header">
              <h2>Bemor Profili (Tibbiy Yozuvlar Dossiyesi)</h2>
              <button className="modal-close" onClick={() => {
                setActiveModal(null);
                setPatientFullProfile(null);
              }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto' }}>
              <div className="patient-profile-dossier">
                
                {/* Profile Sidebar Info */}
                <div className="patient-dossier-sidebar">
                  <div className="dossier-avatar-card">
                    <div className="dossier-avatar">
                      {patientFullProfile.patient_first_name.charAt(0)}
                    </div>
                    <div className="dossier-name">
                      {patientFullProfile.patient_first_name} {patientFullProfile.patient_last_name}
                    </div>
                    <div className="dossier-meta">
                      {patientFullProfile.gender === 'male' ? 'Erkak' : 'Ayol'}, {patientFullProfile.age} yosh
                    </div>
                  </div>

                  <div className="dossier-info-list">
                    <div className="dossier-info-item">
                      <span className="dossier-info-label">Qon Guruhi</span>
                      <span className="dossier-info-value" style={{ color: 'var(--color-warning)' }}>
                        {patientFullProfile.blood_type}
                      </span>
                    </div>

                    <div className="dossier-info-item">
                      <span className="dossier-info-label">Telefon Raqami</span>
                      <span className="dossier-info-value">{patientFullProfile.patient_phone || 'Kiritilmagan'}</span>
                    </div>

                    <div className="dossier-info-item">
                      <span className="dossier-info-label">Email Manzili</span>
                      <span className="dossier-info-value">{patientFullProfile.patient_email || 'Kiritilmagan'}</span>
                    </div>

                    <div className="dossier-info-item">
                      <span className="dossier-info-label">Yashash Manzili</span>
                      <span className="dossier-info-value">{patientFullProfile.address || 'Kiritilmagan'}</span>
                    </div>

                    <div className="dossier-info-item">
                      <span className="dossier-info-label">Favqulodda Aloqa</span>
                      <span className="dossier-info-value" style={{ fontSize: '12px' }}>
                        {patientFullProfile.emergency_contact || 'Kiritilmagan'}
                      </span>
                    </div>

                    <div className="dossier-info-item" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <span className="dossier-info-label">Biriktirilgan Shifokor</span>
                      <span className="dossier-info-value" style={{ color: 'var(--color-primary)' }}>
                        {patientFullProfile.doctor_first_name ? `Dr. ${patientFullProfile.doctor_first_name} ${patientFullProfile.doctor_last_name}` : 'Mavjud emas'}
                      </span>
                      {patientFullProfile.doctor_specialization && (
                        <span className="profile-subtext" style={{ fontSize: '11px' }}>
                          {patientFullProfile.doctor_specialization} ({patientFullProfile.department_name})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Disease Timeline */}
                <div className="patient-dossier-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="timeline-section-title">
                      <Heart size={20} className="menu-item-icon" style={{ color: 'var(--color-danger)' }} />
                      <span>Kasallik Tarixi</span>
                    </div>

                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setDiagnosisInput({
                          patient_id: patientFullProfile.patient_id,
                          doctor_id: patientFullProfile.doctor_id || doctors[0]?.id || '',
                          icd_code: '',
                          description: '',
                          severity: 'mild',
                          status: 'active',
                          notes: '',
                          diagnosed_at: new Date().toISOString().split('T')[0]
                        });
                        setActiveModal('diagnosis_form');
                      }}
                    >
                      <Plus size={12} />
                      <span>Kasallik Qo'shish</span>
                    </button>
                  </div>

                  {(!patientFullProfile.diagnoses || patientFullProfile.diagnoses.length === 0) ? (
                    <div className="empty-state" style={{ backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                      <AlertCircle className="empty-state-icon" />
                      <h3>Kasallik tarixi bo'sh</h3>
                      <p>Ushbu bemor uchun hozirgacha hech qanday tibbiy kasallik yozuvlari ro'yxatdan o'tkazilmagan.</p>
                    </div>
                  ) : (
                    <div className="timeline">
                      {patientFullProfile.diagnoses.map(diag => (
                        <div className={`timeline-item ${diag.severity}`} key={diag.diagnosis_id}>
                          <div className="timeline-marker"></div>
                          <div className="timeline-card">
                            <div className="timeline-header">
                              <span className="timeline-title" style={{ color: 'var(--text-heading)', fontSize: '16px' }}>
                                <span style={{ color: 'var(--color-primary)', marginRight: '6px', fontWeight: '800' }}>
                                  [{diag.icd_code}]
                                </span>
                                {diag.description}
                              </span>
                              <span className="timeline-date">
                                {new Date(diag.diagnosed_at).toLocaleDateString()}
                              </span>
                            </div>

                            {diag.notes && (
                              <p className="timeline-desc" style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-muted)' }}>
                                " {diag.notes} "
                              </p>
                            )}

                            <div className="timeline-meta">
                              <span>
                                Og'irlik darajasi:{' '}
                                <span style={{ 
                                  fontWeight: '700',
                                  color: diag.severity === 'mild' ? 'var(--color-success)' :
                                         diag.severity === 'moderate' ? 'var(--color-primary)' :
                                         diag.severity === 'severe' ? 'var(--color-warning)' : 'var(--color-danger)'
                                }}>
                                  {diag.severity.toUpperCase()}
                                </span>
                              </span>
                              <span>•</span>
                              <span>
                                Holati:{' '}
                                <span className={`badge ${diag.status === 'active' ? 'badge-danger' : 'badge-success'}`} style={{ padding: '2px 8px', fontSize: '10px' }}>
                                  {diag.status.toUpperCase()}
                                </span>
                              </span>
                              <span>•</span>
                              <span>
                                Qo'ygan shifokor: Dr. {diag.doctor_first_name} {diag.doctor_last_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setActiveModal(null);
                  setPatientFullProfile(null);
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Disease form within timeline dossier */}
      {activeModal === 'diagnosis_form' && !isReceptionist && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yangi Kasallik Kiritish</h2>
              <button className="modal-close" onClick={() => setActiveModal('patient_profile')}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleTimelineDiagnosisSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group form-span-2">
                    <label>Mas'ul Shifokor</label>
                    <select 
                      value={diagnosisInput.doctor_id}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, doctor_id: e.target.value })}
                      required
                    >
                      <option value="">Shifokorni tanlang</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kasallik Kategoriyasi</label>
                    <select
                      value={diagnosisInput.icd_code}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, icd_code: e.target.value })}
                      required
                    >
                      <option value="">Kategoriyani tanlang</option>
                      {diseaseCategories.map(category => (
                        <option key={category.code} value={category.code}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group form-full">
                    <label>Kasallik Nomi yoki Tavsifi</label>
                    <input 
                      type="text" 
                      placeholder="Kasallikning rasmiy tibbiy nomi yoki tavsifi"
                      value={diagnosisInput.description}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Og'irlik Darajasi</label>
                    <select 
                      value={diagnosisInput.severity}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, severity: e.target.value })}
                      required
                    >
                      <option value="mild">Yengil (Mild)</option>
                      <option value="moderate">O'rtacha (Moderate)</option>
                      <option value="severe">Og'ir (Severe)</option>
                      <option value="critical">Kritik (Critical)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kasallik Holati</label>
                    <select 
                      value={diagnosisInput.status}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, status: e.target.value })}
                      required
                    >
                      <option value="active">Active (Faol)</option>
                      <option value="resolved">Resolved (Tuzalgan)</option>
                      <option value="chronic">Chronic (Surunkali)</option>
                      <option value="monitoring">Monitoring (Kuzatuvda)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kiritilgan Sana</label>
                    <input 
                      type="date" 
                      value={diagnosisInput.diagnosed_at}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, diagnosed_at: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Tibbiy Eslatma va Retseptlar</label>
                    <textarea 
                      placeholder="Retsept qilingan dorilar, parhezlar..."
                      value={diagnosisInput.notes}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal('patient_profile')}>Bekor Qilish</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Kiritilmoqda...' : 'Kasallikni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Patients;
