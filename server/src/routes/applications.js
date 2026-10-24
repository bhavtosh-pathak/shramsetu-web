import { Router } from 'express';
import { applyToJob, myApplications, applicantsForJob, updateApplicationStatus } from '../controllers/applicationController.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, allowRoles('worker'), applyToJob);
router.get('/mine', protect, allowRoles('worker'), myApplications);
router.get('/job/:jobId', protect, allowRoles('hirer'), applicantsForJob);
router.patch('/:id/status', protect, allowRoles('hirer'), updateApplicationStatus);
export default router;
