import express from 'express';
import {
  addCandidature,
  getCandidatureById,
  getCandidatures,
  getControllerCandidatures,
  getControllerCandidatures2,
  getMyCandidatures,
  updateCandidature,
} from '../controllers/candidatureControllers.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, addCandidature)
  .get(protect, admin, getCandidatures);

router.route('/mescandidatures').get(protect, getMyCandidatures);

router
  .route('/:id')
  .get(protect, getCandidatureById)
  .put(protect, admin, updateCandidature);

router.route('/controlleurs/list').get(protect, getControllerCandidatures);
router.route('/controlleurs/list/2').get(protect, getControllerCandidatures2);

export default router;
