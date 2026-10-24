import WorkerProfile from '../models/WorkerProfile.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const toSkillList = skills => Array.isArray(skills) ? skills.map(s => String(s).trim()).filter(Boolean) : String(skills).split(',').map(s => s.trim()).filter(Boolean);

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = req.user.role === 'worker' ? await WorkerProfile.findOne({ user: req.user._id }) : null;
  res.json({ user: req.user, profile });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { fullName, mobile, age } = req.body;
  if (fullName !== undefined) {
    if (!String(fullName).trim()) throw new HttpError(400, 'Full name cannot be empty.');
    req.user.fullName = String(fullName).trim();
  }
  if (mobile !== undefined) req.user.mobile = String(mobile).trim();
  if (age !== undefined && age !== '' && age !== null) req.user.age = Number(age);
  await req.user.save();

  let profile = null;
  if (req.user.role === 'worker') {
    const { bio, skills, experience, location, availability } = req.body;
    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (skills !== undefined) update.skills = toSkillList(skills);
    if (experience !== undefined) update.experience = experience;
    if (location !== undefined) update.location = location;
    if (availability !== undefined) update.availability = availability;
    profile = await WorkerProfile.findOneAndUpdate({ user: req.user._id }, { $set: update }, { new: true, upsert: true, runValidators: true });
  }
  res.json({ user: req.user, profile });
});

export const listWorkers = asyncHandler(async (_req, res) => {
  const profiles = await WorkerProfile.find().populate('user', 'fullName email mobile age').sort({ updatedAt: -1 });
  res.json({ profiles });
});

export const getWorker = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.params.id }).populate('user', 'fullName email mobile age');
  if (!profile) throw new HttpError(404, 'Worker profile not found.');
  res.json({ profile });
});
