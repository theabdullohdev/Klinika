import { Users, Award, FolderHeart, Activity, BarChart2 } from 'lucide-react';

function Overview({ patients, doctors, diagnoses, departments, doctorStats }) {
  return (
    <>
      {/* Quick Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-info">
            <span className="stat-label">Barcha Bemorlar</span>
            <span className="stat-value">{patients.length}</span>
            <div className="stat-badge success">Tizimda faol</div>
          </div>
          <div className="stat-icon-box">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-info">
            <span className="stat-label">Jami Shifokorlar</span>
            <span className="stat-value">{doctors.length}</span>
            <div className="stat-badge success">Ro'yxatdan o'tgan</div>
          </div>
          <div className="stat-icon-box">
            <Award size={24} />
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-info">
            <span className="stat-label">Klinik Tashxislar</span>
            <span className="stat-value">{diagnoses.length}</span>
            <div className="stat-badge success">Jami yozuvlar</div>
          </div>
          <div className="stat-icon-box">
            <FolderHeart size={24} />
          </div>
        </div>

        <div className="stat-card amber">
          <div className="stat-info">
            <span className="stat-label">Klinika Bo'limlari</span>
            <span className="stat-value">{departments.length}</span>
            <div className="stat-badge success">Faol bo'limlar</div>
          </div>
          <div className="stat-icon-box">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Doctor Stats Panel */}
      <div className="dashboard-panel">
        <div className="control-bar">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--text-heading)' }}>
            Shifokorlar Yuklamasi va Statistikasi (vw_doctor_stats)
          </h2>
        </div>
        
        <div className="table-wrapper">
          {doctorStats.length === 0 ? (
            <div className="empty-state">
              <BarChart2 className="empty-state-icon" />
              <h3>Ma'lumotlar mavjud emas</h3>
              <p>Hozircha shifokorlar va ular biriktirilgan bemorlar statistikasi bo'sh.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shifokor Ismi</th>
                  <th>Mutaxassisligi</th>
                  <th>Klinika Bo'limi</th>
                  <th>Bemorlari Soniga Yuklama</th>
                  <th>Faol Tashxislari</th>
                  <th>Ish Holati</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map(stat => (
                  <tr key={stat.doctor_id}>
                    <td>
                      <div className="profile-cell">
                        <div className="profile-avatar">
                          {stat.doctor_name.charAt(0)}
                        </div>
                        <div>
                          <span className="profile-name">Dr. {stat.doctor_name}</span>
                          <div className="profile-subtext">ID: {stat.doctor_id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>{stat.specialization}</td>
                    <td>
                      <span className="badge badge-primary">{stat.department_name}</span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-heading)' }}>
                      {stat.total_patients} bemor biriktirilgan
                    </td>
                    <td>
                      <span className="badge badge-warning">{stat.active_diagnoses} faol holatda</span>
                    </td>
                    <td>
                      <span className={`badge ${stat.is_available ? 'badge-success' : 'badge-danger'}`}>
                        {stat.is_available ? 'Qabul qilmoqda' : 'Band / Ta\'tilda'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default Overview;
