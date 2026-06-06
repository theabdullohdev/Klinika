import { query } from '../config/connection.js';

export const getAllDiagnoses = async (req, res) => {
  const { patient_id, doctor_id, icd_code, severity, status } = req.query;
  try {
    let sql = 'SELECT * FROM diagnoses WHERE 1=1';
    const params = [];

    if (req.user.role === 'clinician') {
      const docRes = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
      if (docRes.rows.length > 0) {
        const loggedInDoctorId = docRes.rows[0].id;
        params.push(loggedInDoctorId);
        sql += ` AND (doctor_id = $${params.length} OR patient_id IN (SELECT id FROM patients WHERE doctor_id = $${params.length}))`;
      } else {
        sql += ' AND 1=0';
      }
    } else if (doctor_id) {
      params.push(doctor_id);
      sql += ` AND doctor_id = $${params.length}`;
    }

    if (patient_id) {
      params.push(patient_id);
      sql += ` AND patient_id = $${params.length}`;
    }
    if (icd_code) {
      params.push(icd_code);
      sql += ` AND icd_code = $${params.length}`;
    }
    if (severity) {
      params.push(severity);
      sql += ` AND severity = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY diagnosed_at DESC';
    const result = await query(sql, params, req.user.role);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching diagnoses.' });
  }
};

export const getDiagnosisById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM diagnoses WHERE id = $1', [id], req.user.role);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Diagnosis not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching diagnosis.' });
  }
};

export const createDiagnosis = async (req, res) => {
  const { patient_id, doctor_id, icd_code, description, severity, status, notes, diagnosed_at } = req.body;
  try {
    let finalDoctorId = doctor_id;
    if (req.user.role === 'clinician') {
      const docRes = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
      if (docRes.rows.length > 0) {
        finalDoctorId = docRes.rows[0].id;
      } else {
        return res.status(400).json({ message: 'Logged-in user is a clinician but has no associated doctor profile.' });
      }
    }

    const result = await query(
      `INSERT INTO diagnoses (patient_id, doctor_id, icd_code, description, severity, status, notes, diagnosed_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [patient_id, finalDoctorId, icd_code, description, severity, status || 'active', notes, diagnosed_at || new Date()],
      req.user.role
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating diagnosis record. Check ICD code format.' });
  }
};

export const updateDiagnosis = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const setClause = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const result = await query(
      `UPDATE diagnoses SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id],
      req.user.role
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Diagnosis not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating diagnosis record.' });
  }
};

export const deleteDiagnosis = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM diagnoses WHERE id = $1 RETURNING *', [id], req.user.role);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Diagnosis not found.' });
    res.json({ message: 'Diagnosis record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting diagnosis record.' });
  }
};
