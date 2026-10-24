import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import profileRoutes from './routes/profile.js';
import { notFound, errorHandler } from './middleware/errors.js';

if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is missing in server/.env'); process.exit(1); }
const app = express();
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(v => v.trim().replace(/\/$/, '')).filter(Boolean);
const isLocalDev = origin => process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
app.use(cors({ origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) || isLocalDev(origin)) ? cb(null, true) : cb(new Error(`CORS blocked for origin ${origin}`)), credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }), authRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ShramSetu API' }));
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFound); app.use(errorHandler);
const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`ShramSetu API listening on port ${port}`))).catch(err => { console.error('Could not start API:', err.message); process.exit(1); });
