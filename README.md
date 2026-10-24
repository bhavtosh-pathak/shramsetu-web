# ShramSetu Web (MERN)

Responsive React conversion of the uploaded Flutter ShramSetu project. The original Flutter source is not modified. This web project replaces Firebase with Express REST APIs and MongoDB Atlas.

## Requirements
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

## Setup
1. Create a MongoDB Atlas cluster and database user. Allow your current IP in Network Access.
2. In `server/`, copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
3. Install dependencies from this folder:
   ```bash
   npm run install:all
   ```
4. Run frontend and backend together:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173. API health check: http://localhost:5000/api/health

## Project structure
```
server/src
  config/        db.js
  controllers/   authController, jobController, applicationController, profileController
  middleware/    auth.js (JWT + role check), errors.js
  models/        User, WorkerProfile, Job, JobApplication
  routes/        thin route files that only connect URLs to controllers
  utils/         asyncHandler (error wrapper + HttpError), serializers
client/src
  context/       AuthContext (session state)
  services/      api.js (axios + error messages)
  utils/         storage.js (safe localStorage wrapper)
  pages/ components/
```

## Features
- Worker/Hirer signup and login with bcrypt password hashing and JWT
- Role-protected routes and server-side ownership checks
- Worker dashboard, available jobs, apply, applied jobs, profile edit
- Hirer dashboard, post jobs, manage own jobs, view applicants and update status
- MongoDB models for users, worker profiles, jobs and applications
- Responsive design based on the original orange/green ShramSetu branding

## Notes
- Email verification and password reset need an email provider and are not enabled in this first migration scaffold.
- Existing Firebase data is not automatically migrated. New accounts and records are saved in MongoDB.
- Never commit `server/.env`. For production, use HTTPS and consider moving JWTs to secure HttpOnly cookies plus a CSRF strategy.

## MongoDB Atlas checklist
- Create a database user with a strong password.
- Add your development IP in Atlas Network Access (avoid `0.0.0.0/0` except temporary testing).
- Copy the Node.js connection string into `server/.env`; URL-encode special characters in the database password.
- Keep the database connection string and JWT secret on the server only.

## Current migration scope
The source Flutter app's core flows have been recreated in React: worker/hirer account creation, login, dashboards, vacancy search, job posting, application tracking, applicant status, worker directory, and profile editing. Existing Firebase data is not copied automatically. Password reset/email verification, ratings, hiring requests, and image uploads from the original app are not included in this first migration build; these need additional services/models and should be added before claiming feature parity.

## Design system
- Tokens (colours, radii, shadows, fonts) live at the top of `client/src/styles.css` as CSS variables. Primary `#176B4D`, accent `#F59E0B`, text `#1F2937`.
- Logo: `LogoMark` / `Brand` in `client/src/components/UI.jsx` (bridge made of two arcs: worker side + hirer side). Favicon: `client/public/favicon.svg`.
- Illustration: `client/src/components/Illustrations.jsx` (`BridgeScene`).
- The old raster logo `src/assets/applogo.png` is no longer used and can be deleted.
