import express from 'express';
import * as doctorController from '../controllers/doctorController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor profile management
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: List doctors
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: department_id
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/', doctorController.getAllDoctors);

/**
 * @swagger
 * /api/doctors/stats:
 *   get:
 *     summary: Get doctor statistics
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats for all doctors
 */
router.get('/stats', authorizeRoles('admin'), doctorController.getDoctorStats);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Doctor profile
 */
router.get('/:id', doctorController.getDoctorById);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create a doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department_id, first_name, last_name, specialization, license_number]
 *             properties:
 *               user_id: { type: string, format: uuid }
 *               department_id: { type: string, format: uuid }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               specialization: { type: string }
 *               license_number: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               bio: { type: string }
 *     responses:
 *       201:
 *         description: Doctor profile created
 */
router.post('/', authorizeRoles('admin'), doctorController.createDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update a doctor profile
 *     tags: [Doctors]
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
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               specialization: { type: string }
 *               phone: { type: string }
 *               is_available: { type: boolean }
 *     responses:
 *       200:
 *         description: Doctor profile updated
 */
router.put('/:id', authorizeRoles('admin'), doctorController.updateDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Doctor profile deleted
 */
router.delete('/:id', authorizeRoles('admin'), doctorController.deleteDoctor);

export default router;
