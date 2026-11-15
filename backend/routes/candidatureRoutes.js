import express from 'express';
import {
  addCandidature,
  getCandidatureById,
  getCandidatures,
  getControllerCandidatures,
  getControllerCandidatures2,
  getControllerCandidatures3,
  getMyCandidatures,
  updateCandidature,
  runCandidatureAIAudit,
  runBatchAIAudit,
  validateBatchControl1,
  validateBatchControl2,
  validateBatchControl3,
} from '../controllers/candidatureControllers.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, addCandidature)
  .get(protect, admin, getCandidatures);

router.route('/mescandidatures').get(protect, getMyCandidatures);

router.route('/batch/ai-audit').post(protect, admin, runBatchAIAudit);
router.route('/batch/validate-control1').post(protect, admin, validateBatchControl1);
router.route('/batch/validate-control2').post(protect, admin, validateBatchControl2);
router.route('/batch/validate-control3').post(protect, admin, validateBatchControl3);
router.route('/:id/ai-audit').post(protect, admin, runCandidatureAIAudit);

router.route('/controlleurs/list').get(protect, getControllerCandidatures);
router.route('/controlleurs/list/2').get(protect, getControllerCandidatures2);
router.route('/controlleurs/list/3').get(protect, getControllerCandidatures3);

router
  .route('/:id')
  .get(protect, getCandidatureById)
  .put(protect, admin, updateCandidature);

export default router;
