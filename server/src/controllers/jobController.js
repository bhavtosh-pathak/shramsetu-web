import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const JOB_FIELDS = ['title', 'location', 'wages', 'duration', 'description'];

export const listJobs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.mine === 'true') {
    if (req.user.role !== 'hirer') throw new HttpError(403, 'Hirer account required.');
    filter.hirer = req.user._id;
  } else {
    filter.status = 'open';
  }
  const term = req.query.search?.trim();
  if (term) filter.$or = ['title', 'location', 'description'].map(field => ({ [field]: { $regex: escapeRegex(term), $options: 'i' } }));
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).populate('hirer', 'fullName email');
  res.json({ jobs });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('hirer', 'fullName email');
  if (!job) throw new HttpError(404, 'Job not found.');
  res.json({ job });
});

export const createJob = asyncHandler(async (req, res) => {
  const values = Object.fromEntries(JOB_FIELDS.map(f => [f, req.body[f]]));
  if (!JOB_FIELDS.every(f => typeof values[f] === 'string' && values[f].trim())) throw new HttpError(400, 'Please fill every job field.');
  for (const f of JOB_FIELDS) values[f] = values[f].trim();
  if (values.description.length > 3000) throw new HttpError(400, 'Description must be 3000 characters or fewer.');
  const job = await Job.create({ ...values, hirer: req.user._id, hirerName: req.user.fullName, hirerEmail: req.user.email });
  res.status(201).json({ job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, hirer: req.user._id });
  if (!job) throw new HttpError(404, 'Job not found or not owned by you.');
  for (const key of [...JOB_FIELDS, 'status']) {
    if (req.body[key] !== undefined) job[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
  }
  await job.save();
  res.json({ job });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, hirer: req.user._id });
  if (!job) throw new HttpError(404, 'Job not found or not owned by you.');
  await JobApplication.deleteMany({ job: job._id });
  res.json({ message: 'Job deleted.' });
});
