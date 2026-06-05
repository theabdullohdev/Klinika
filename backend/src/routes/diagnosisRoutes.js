import express from 'express';
import * as diagnosisController from '../controllers/diagnosisController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Diagnoses
 *   description: Diagnosis and disease record management
 */

/**
 * @swagger
 * /api/diagnoses:
 *   get:
 *     summary: List diagnoses
 *     tags: [Diagnoses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: doctor_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, resolved, chronic, monitoring] }
 *     responses:
 *       200:
 *         description: List of diagnoses
 */
router.get('/', authorizeRoles('admin', 'clinician'), diagnosisController.getAllDiagnoses);

/**
 * @swagger
 * /api/diagnoses/{id}:
 *   get:
 *     summary: Get diagnosis by ID
 *     tags: [Diagnoses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Diagnosis data
 */
router.get('/:id', authorizeRoles('admin', 'clinician'), diagnosisController.getDiagnosisById);

/**
 * @swagger
 * /api/diagnoses:
 *   post:
 *     summary: Create a diagnosis record
 *     tags: [Diagnoses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, icd_code, description, severity]
 *             properties:
 *               patient_id: { type: string, format: uuid }
 *               doctor_id: { type: string, format: uuid }
 *               icd_code: { type: string }
 *               description: { type: string }
 *               severity: { type: string, enum: [mild, moderate, severe, critical] }
 *               status: { type: string, enum: [active, resolved, chronic, monitoring] }
 *               notes: { type: string }
 *               diagnosed_at: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Diagnosis created
 */
router.post('/', authorizeRoles('admin', 'clinician'), diagnosisController.createDiagnosis);

/**
 * @swagger
 * /api/diagnoses/{id}:
 *   put:
 *     summary: Update a diagnosis record
 *     tags: [Diagnoses]
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
 *               description: { type: string }
 *               severity: { type: string }
 *               status: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Diagnosis record updated
 */
router.put('/:id', authorizeRoles('admin', 'clinician'), diagnosisController.updateDiagnosis);

/**
 * @swagger
 * /api/diagnoses/{id}:
 *   delete:
 *     summary: Delete a diagnosis record
 *     tags: [Diagnoses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Diagnosis record deleted
 */
router.delete('/:id', authorizeRoles('admin'), diagnosisController.deleteDiagnosis);

export default router;
