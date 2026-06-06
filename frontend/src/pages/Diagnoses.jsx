import { useState } from 'react';
import { Plus, Edit2, Trash2, FolderHeart, X } from 'lucide-react';

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

const getDiseaseCategoryLabel = (code) => {
  const prefix = code?.charAt(0);
  return diseaseCategories.find((category) => category.code.charAt(0) === prefix)?.label || 'Kategoriya tanlanmagan';
};

function Diagnoses({ diagnoses, doctors, isAdmin, loading, setLoading, fetchDiagnoses, apiRequest }) {
  const [diagDoctorFilter, setDiagDoctorFilter] = useState('');
  const [diagCategoryFilter, setDiagCategoryFilter] = useState('');
  const [diagSeverityFilter, setDiagSeverityFilter] = useState('');
  const [activeModal, setActiveModal] = useState(null); // null | 'diagnosis_form'
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  const [diagnosisInput, setDiagnosisInput] = useState({
    patient_id: '', doctor_id: '', icd_code: '', description: '', 
    severity: 'mild', status: 'active', notes: '', diagnosed_at: new Date().toISOString().split('T')[0]
  });

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisInput.icd_code) {
      alert('Kasallik kategoriyasini tanlang.');
      return;
    }

    setLoading(true);
    try {
      const formattedInput = { ...diagnosisInput };
      delete formattedInput.patient_id;

      if (selectedDiagnosis) {
        await apiRequest('PUT', `/diagnoses/${selectedDiagnosis.id}`, {
          doctor_id: formattedInput.doctor_id,
          icd_code: formattedInput.icd_code,
          description: formattedInput.description,
          severity: formattedInput.severity,
          status: formattedInput.status,
          notes: formattedInput.notes
        });
        alert('Kasallik yozuvi yangilandi!');
      } else {
        await apiRequest('POST', '/diagnoses', formattedInput);
        alert('Yangi kasallik muvaffaqiyatli kiritildi!');
      }
      setActiveModal(null);
      fetchDiagnoses();
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi. Iltimos tekshirib qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const openDiagnosisEdit = (diag) => {
    setSelectedDiagnosis(diag);
    setDiagnosisInput({
      patient_id: diag.patient_id,
      doctor_id: diag.doctor_id || '',
      icd_code: diag.icd_code,
      description: diag.description,
      severity: diag.severity,
      status: diag.status,
      notes: diag.notes || '',
      diagnosed_at: diag.diagnosed_at.split('T')[0]
    });
    setActiveModal('diagnosis_form');
  };

  const handleDeleteDiagnosis = async (id) => {
    if (!isAdmin) return alert('Kasalliklarni o\'chirish huquqi faqat administratorga tegishli.');
    if (!confirm('Ushbu kasallik yozuvini o\'chirishni xohlaysizmi?')) return;
    try {
      await apiRequest('DELETE', `/diagnoses/${id}`);
      alert('Kasallik yozuvi o\'chirildi!');
      fetchDiagnoses();
    } catch (err) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    }
  };

  const filteredDiagnoses = diagnoses.filter(d => {
    const matchesDoctor = diagDoctorFilter === '' || d.doctor_id === diagDoctorFilter;
    const matchesCategory = diagCategoryFilter === '' || d.icd_code?.charAt(0) === diagCategoryFilter;
    const matchesSeverity = diagSeverityFilter === '' || d.severity === diagSeverityFilter;
    return matchesDoctor && matchesCategory && matchesSeverity;
  });

  return (
    <>
      {/* Search Header Action inside page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexGrow: 1 }}>
          <select 
            className="filter-select"
            value={diagDoctorFilter}
            onChange={(e) => setDiagDoctorFilter(e.target.value)}
          >
            <option value="">Barcha shifokorlar</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={diagCategoryFilter}
            onChange={(e) => setDiagCategoryFilter(e.target.value)}
          >
            <option value="">Barcha kategoriyalar</option>
            {diseaseCategories.map(category => (
              <option key={category.code} value={category.code.charAt(0)}>{category.label}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={diagSeverityFilter}
            onChange={(e) => setDiagSeverityFilter(e.target.value)}
          >
            <option value="">Barcha og'irlik darajalari</option>
            <option value="mild">Yengil</option>
            <option value="moderate">O'rtacha</option>
            <option value="severe">Og'ir</option>
            <option value="critical">Kritik</option>
          </select>
        </div>

        <button 
          className="btn btn-primary"
          style={{ marginLeft: '16px', flexShrink: 0 }}
          onClick={() => {
            setSelectedDiagnosis(null);
            setDiagnosisInput({
              patient_id: '', doctor_id: doctors[0]?.id || '', icd_code: '', description: '', 
              severity: 'mild', status: 'active', notes: '', diagnosed_at: new Date().toISOString().split('T')[0]
            });
            setActiveModal('diagnosis_form');
          }}
        >
          <Plus size={16} />
          <span>Kasallik Qo'shish</span>
        </button>
      </div>

      <div className="dashboard-panel">
        <div className="table-wrapper">
          {filteredDiagnoses.length === 0 ? (
            <div className="empty-state">
              <FolderHeart className="empty-state-icon" />
              <h3>Hech qanday kasallik yozuvi topilmadi</h3>
              <p>Qidiruv shartlariga mos keluvchi kasallik yozuvlari mavjud emas.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kasallik kategoriyasi</th>
                  <th>Kasallik tavsifi</th>
                  <th>Shifokor</th>
                  <th>Og'irlik Darajasi</th>
                  <th>Holati</th>
                  <th>Kiritilgan Sana</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiagnoses.map(diag => {
                  const doctor = doctors.find(d => d.id === diag.doctor_id);
                  return (
                    <tr key={diag.id}>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {getDiseaseCategoryLabel(diag.icd_code)}
                      </td>
                      <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{diag.description}</div>
                        {diag.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Eslatma: {diag.notes}</div>}
                      </td>
                      <td>
                        {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Noma\'lum shifokor'}
                      </td>
                      <td>
                        <span className={`badge ${
                          diag.severity === 'mild' ? 'badge-success' :
                          diag.severity === 'moderate' ? 'badge-primary' :
                          diag.severity === 'severe' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {diag.severity === 'mild' && 'Yengil'}
                          {diag.severity === 'moderate' && 'O\'rtacha'}
                          {diag.severity === 'severe' && 'Og\'ir'}
                          {diag.severity === 'critical' && 'Kritik'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${diag.status === 'active' ? 'badge-danger' : diag.status === 'resolved' ? 'badge-success' : diag.status === 'chronic' ? 'badge-warning' : 'badge-primary'}`}>
                          {diag.status === 'active' && 'Faol'}
                          {diag.status === 'resolved' && 'Tuzalgan'}
                          {diag.status === 'chronic' && 'Surunkali'}
                          {diag.status === 'monitoring' && 'Kuzatuvda'}
                        </span>
                      </td>
                      <td>{new Date(diag.diagnosed_at).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-action edit" onClick={() => openDiagnosisEdit(diag)} title="Tahrirlash">
                            <Edit2 size={16} />
                          </button>
                          {isAdmin && (
                            <button className="btn-action delete" onClick={() => handleDeleteDiagnosis(diag.id)} title="O'chirish">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Disease Form */}
      {activeModal === 'diagnosis_form' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedDiagnosis ? 'Kasallik Yozuvini Tahrirlash' : 'Yangi Kasallik Kiritish'}</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDiagnosisSubmit}>
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
                      <option value="mild">Yengil</option>
                      <option value="moderate">O'rtacha</option>
                      <option value="severe">Og'ir</option>
                      <option value="critical">Kritik</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kasallik Holati</label>
                    <select 
                      value={diagnosisInput.status}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, status: e.target.value })}
                      required
                    >
                      <option value="active">Faol</option>
                      <option value="resolved">Tuzalgan</option>
                      <option value="chronic">Surunkali</option>
                      <option value="monitoring">Kuzatuvda</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kiritilgan Sana</label>
                    <input 
                      type="date" 
                      value={diagnosisInput.diagnosed_at}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, diagnosed_at: e.target.value })}
                      required
                      disabled={!!selectedDiagnosis}
                    />
                  </div>

                  <div className="form-group form-full">
                    <label>Tibbiy Eslatma va Retseptlar</label>
                    <textarea 
                      placeholder="Retsept qilingan dorilar, parhezlar yoki keyingi tekshiruvlar haqida eslatma..."
                      value={diagnosisInput.notes}
                      onChange={(e) => setDiagnosisInput({ ...diagnosisInput, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Bekor Qilish</button>
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

export default Diagnoses;
