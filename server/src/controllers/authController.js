import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { publicUser } from '../utils/serializers.js';
import sendEmail from '../utils/sendEmail.js';

const issueToken = user => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const authResponse = user => ({ token: issueToken(user), user: publicUser(user) });
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, '');

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, mobile = '', age, role } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password || !role) throw new HttpError(400, 'Name, email, password and role are required.');
  if (!['worker', 'hirer'].includes(role)) throw new HttpError(400, 'Choose a valid role.');
  if (password.length < 8) throw new HttpError(400, 'Password must contain at least 8 characters.');
  if (age && Number(age) < 18) throw new HttpError(400, 'You must be at least 18 years old.');
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw new HttpError(409, 'An account with this email already exists.');
  const user = await User.create({
    fullName: fullName.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12),
    mobile: String(mobile).trim(), age: age ? Number(age) : undefined, role
  });
  if (role === 'worker') await WorkerProfile.create({ user: user._id });
  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, 'Invalid email or password.');
  res.json(authResponse(user));
});

export const me = (req, res) => res.json({ user: publicUser(req.user) });

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) throw new HttpError(400, 'Email is required.');
  const generic = { message: 'If this email is registered, a password reset link has been sent. It is valid for 15 minutes.' };

  const user = await User.findOne({ email });
  if (!user) return res.json(generic); // email registered hai ya nahi, ye nahi batate

  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne({ _id: user._id }, { $set: {
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000)
  } });

  const link = `${clientUrl()}/reset-password/${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your ShramSetu password',
      html: `<div style="font-family:Arial,sans-serif;max-width:480px">
        <h2 style="color:#166a4d">ShramSetu</h2>
        <p>Hello ${user.fullName},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link is valid for 15 minutes.</p>
        <p><a href="${link}" style="background:#166a4d;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p>
        <p style="color:#666;font-size:13px">If the button does not work, copy this link:<br>${link}</p>
        <p style="color:#666;font-size:13px">If you did not request this, you can ignore this email.</p>
      </div>`
    });
  } catch (err) {
    console.error('Reset email failed:', err.message);
    await User.updateOne({ _id: user._id }, { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } });
    throw new HttpError(500, 'Could not send the reset email. Please try again later.');
  }
  res.json(generic);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) throw new HttpError(400, 'Password must contain at least 8 characters.');

  const user = await User.findOne({
    resetPasswordToken: hashToken(req.params.token),
    resetPasswordExpires: { $gt: new Date() }
  });
  if (!user) throw new HttpError(400, 'This reset link is invalid or has expired. Please request a new one.');

  await User.updateOne({ _id: user._id }, {
    $set: { passwordHash: await bcrypt.hash(password, 12) },
    $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
  });
  res.json({ message: 'Your password has been updated. You can sign in now.' });
});