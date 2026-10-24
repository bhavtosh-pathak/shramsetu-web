import { Router } from 'express';
import { listJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, listJobs);
router.post('/', protect, allowRoles('hirer'), createJob);
router.get('/:id', protect, getJob);
router.patch('/:id', protect, allowRoles('hirer'), updateJob);
router.delete('/:id', protect, allowRoles('hirer'), deleteJob);
export default router;
