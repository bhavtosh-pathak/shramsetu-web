import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId, coverNote = '' } = req.body;
  if (!jobId) throw new HttpError(400, 'jobId is required.');
  const job = await Job.findOne({ _id: jobId, status: 'open' });
  if (!job) throw new HttpError(404, 'This job is no longer available.');
  if (String(job.hirer) === String(req.user._id)) throw new HttpError(400, 'You cannot apply to your own job.');
  if (await JobApplication.exists({ job: jobId, worker: req.user._id })) throw new HttpError(409, 'You have already applied for this job.');
  const application = await JobApplication.create({ job: jobId, worker: req.user._id, coverNote });
  res.status(201).json({ application });
});

export const myApplications = asyncHandler(async (req, res) => {
  const applications = await JobApplication.find({ worker: req.user._id }).sort({ createdAt: -1 }).populate('job');
  res.json({ applications });
});

export const applicantsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, hirer: req.user._id });
  if (!job) throw new HttpError(404, 'Job not found or not owned by you.');
  const applications = await JobApplication.find({ job: job._id }).sort({ createdAt: -1 }).populate('worker', 'fullName email mobile age').lean();
  res.json({ applications });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  if (!['pending', 'accepted', 'rejected'].includes(req.body.status)) throw new HttpError(400, 'Invalid application status.');
  const application = await JobApplication.findById(req.params.id).populate('job');
  if (!application || !application.job || String(application.job.hirer) !== String(req.user._id)) throw new HttpError(404, 'Application not found for your jobs.');
  application.status = req.body.status;
  await application.save();
  res.json({ application });
});
