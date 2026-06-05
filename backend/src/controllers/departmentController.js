import { query } from '../config/connection.js';

export const getAllDepartments = async (req, res) => {
  try {
    const result = await query('SELECT * FROM departments WHERE is_active = true ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments.' });
  }
};

export const createDepartment = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error creating department. Name might already exist.' });
  }
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;
  try {
    const result = await query(
      'UPDATE departments SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *',
      [name, description, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department.' });
  }
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    // Soft delete
    const result = await query('UPDATE departments SET is_active = false WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating department.' });
  }
};
