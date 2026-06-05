# CareTrack Clinic - Medical Record Management System (MRMS) API

This is the backend API for CareTrack Clinic, built with Node.js, Express, and PostgreSQL.

## Features
- **Role-Based Access Control (RBAC)**: Admin, Clinician, Receptionist.
- **Doctor Management**: CRUD operations and search for doctor profiles.
- **Patient Management**: Registration, profile updates, and full clinical history.
- **Diagnosis Tracking**: Secure recording of patient diagnoses with ICD codes.
- **Search & Filter**: Comprehensive filtering across all major entities.
- **Security**: JWT Authentication and PostgreSQL Row Level Security (RLS).
- **Interactive Documentation**: Swagger UI available at `/api-docs`.

## Tech Stack
- **Node.js & Express.js**
- **PostgreSQL** (with Views, Triggers, and RLS)
- **JWT** (JSON Web Tokens)
- **Bcrypt** (Password Hashing)

---

## API Endpoints

### 1. Authentication
| Method | Endpoint | Description | Role Required |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/me` | Get current user profile | Authenticated |

### 2. Departments
| Method | Endpoint | Description | Role Required |
| --- | --- | --- | --- |
| GET | `/api/departments` | Get all active departments | Authenticated |
| POST | `/api/departments` | Create new department | Admin |
| PUT | `/api/departments/:id` | Update department | Admin |
| DELETE | `/api/departments/:id` | Deactivate department | Admin |

### 3. Doctors
| Method | Endpoint | Description | Role Required |
| --- | --- | --- | --- |
| GET | `/api/doctors` | List doctors (filter by search, department) | Authenticated |
| GET | `/api/doctors/stats` | Get doctor performance stats | Admin |
| GET | `/api/doctors/:id` | Get specific doctor profile | Authenticated |
| POST | `/api/doctors` | Create doctor profile | Admin |
| PUT | `/api/doctors/:id` | Update doctor profile | Admin |
| DELETE | `/api/doctors/:id` | Delete doctor profile | Admin |

### 4. Patients
| Method | Endpoint | Description | Role Required |
| --- | --- | --- | --- |
| GET | `/api/patients` | List patients (filter by search, doctor) | Authenticated |
| GET | `/api/patients/:id` | Get patient details | Authenticated |
| GET | `/api/patients/:id/full-profile` | Get patient, doctor, and diagnoses | Authenticated |
| POST | `/api/patients` | Register new patient | Admin, Receptionist |
| PUT | `/api/patients/:id` | Update patient record | Admin, Clinician |
| DELETE | `/api/patients/:id` | Delete patient record | Admin |

### 5. Diagnoses
| Method | Endpoint | Description | Role Required |
| --- | --- | --- | --- |
| GET | `/api/diagnoses` | List diagnoses (filter by patient, doctor, status) | Admin, Clinician |
| POST | `/api/diagnoses` | Create diagnosis record | Admin, Clinician |
| PUT | `/api/diagnoses/:id` | Update diagnosis record | Admin, Clinician |
| DELETE | `/api/diagnoses/:id` | Delete diagnosis record | Admin |

---

## Setup Instructions

1. **Database Setup**:
   - Create a PostgreSQL database named `caretrack_clinic`.
   - Run the provided SQL script to create tables, enums, views, and RLS policies.

2. **Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add `DATABASE_URL` and `JWT_SECRET`.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the Server**:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

## Role Summary
- **Administrator**: Full access to all records and stats.
- **Clinician**: View and update Patient and Diagnosis records.
- **Receptionist**: Register new Patients and view Doctor schedules (via Doctor list).
