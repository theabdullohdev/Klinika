import { query } from '../config/connection.js';

export const getAllPatients = async (req, res) => {
  const { search, doctor_id } = req.query;
  try {
    let sql = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length})`;
    }

    if (doctor_id) {
      params.push(doctor_id);
      sql += ` AND doctor_id = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params, req.user.role);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients.' });
  }
};

export const getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM patients WHERE id = $1', [id], req.user.role);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Patient not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient.' });
  }
};

// Full Patient Profile showing assigned Doctor and all linked Disease/Diagnosis records
export const getPatientFullProfile = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get profile from view
    const profileRes = await query('SELECT * FROM vw_patient_profiles WHERE patient_id = $1', [id], req.user.role);
    if (profileRes.rows.length === 0) return res.status(404).json({ message: 'Patient not found.' });
    
    const profile = profileRes.rows[0];

    // 2. Get diagnoses from view
    const diagnosesRes = await query('SELECT * FROM vw_patient_diagnoses WHERE patient_id = $1', [id], req.user.role);
    
    res.json({
      ...profile,
      diagnoses: diagnosesRes.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching full patient profile.' });
  }
};

export const createPatient = async (req, res) => {
  const { doctor_id, first_name, last_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO patients (doctor_id, first_name, last_name, date_of_birth, gender, blood_type, phone, email, address, emergency_contact, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [doctor_id, first_name, last_name, date_of_birth, gender, blood_type || 'unknown', phone, email, address, emergency_contact, notes],
      req.user.role
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error creating patient record.' });
  }
};

export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const setClause = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const result = await query(
      `UPDATE patients SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id],
      req.user.role
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Patient not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating patient record.' });
  }
};

export const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM patients WHERE id = $1 RETURNING *', [id], req.user.role);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Patient not found.' });
    res.json({ message: 'Patient record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient record.' });
  }
};
