import express from 'express';
import * as patientController from '../controllers/patientController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient record management
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: List patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: doctor_id
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/', patientController.getAllPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Patient data
 */
router.get('/:id', patientController.getPatientById);

/**
 * @swagger
 * /api/patients/{id}/full-profile:
 *   get:
 *     summary: Get full patient profile (with doctor and diagnoses)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Full profile data
 */
router.get('/:id/full-profile', patientController.getPatientFullProfile);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, date_of_birth, gender]
 *             properties:
 *               doctor_id: { type: string, format: uuid }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               date_of_birth: { type: string, format: date }
 *               gender: { type: string, enum: [male, female, other] }
 *               blood_type: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               address: { type: string }
 *               emergency_contact: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Patient registered
 */
router.post('/', authorizeRoles('admin', 'clinician', 'receptionist'), patientController.createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update a patient record
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor_id: { type: string, format: uuid }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Patient record updated
 */
router.put('/:id', authorizeRoles('admin', 'clinician'), patientController.updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient record
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Patient record deleted
 */
router.delete('/:id', authorizeRoles('admin'), patientController.deletePatient);

export default router;
