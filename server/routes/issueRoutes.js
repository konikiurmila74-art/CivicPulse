import { Router } from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  getIssueByTrackingId,
  updateIssue,
  updateStatus,
  deleteIssue,
} from '../controllers/issueController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/').get(protect, getIssues).post(protect, createIssue);

router.get('/track/:trackingId', protect, getIssueByTrackingId);

router
  .route('/:id')
  .get(protect, getIssueById)
  .patch(protect, updateIssue)
  .delete(protect, deleteIssue);

router.patch('/:id/status', protect, updateStatus);

export default router;
