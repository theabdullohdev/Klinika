import { query } from '../config/connection.js';

export const getAllDoctors = async (req, res) => {
  const { search, department_id } = req.query;
  try {
    let sql = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR specialization ILIKE $${params.length})`;
    }

    if (department_id) {
      params.push(department_id);
      sql += ` AND department_id = $${params.length}`;
    }

    sql += ' ORDER BY last_name ASC';
    const result = await query(sql, params, req.user.role);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors.' });
  }
};

export const getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM doctors WHERE id = $1', [id], req.user.role);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Doctor not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor.' });
  }
};

export const getDoctorStats = async (req, res) => {
  try {
    const result = await query('SELECT * FROM vw_doctor_stats', [], req.user.role);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor statistics.' });
  }
};

export const createDoctor = async (req, res) => {
  const { user_id, department_id, first_name, last_name, specialization, license_number, phone, email, bio } = req.body;
  try {
    const result = await query(
      `INSERT INTO doctors (user_id, department_id, first_name, last_name, specialization, license_number, phone, email, bio) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user_id, department_id, first_name, last_name, specialization, license_number, phone, email, bio],
      req.user.role
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating doctor profile.' });
  }
};

export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const setClause = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const result = await query(
      `UPDATE doctors SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id],
      req.user.role
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Doctor not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating doctor profile.' });
  }
};

export const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM doctors WHERE id = $1 RETURNING *', [id], req.user.role);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ message: 'Doctor profile deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor profile.' });
  }
};
