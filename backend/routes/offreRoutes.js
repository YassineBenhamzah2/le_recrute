import express from 'express';
import {
  getOffres,
  getOffreById,
  createOffre,
  deleteOffre,
  updateOffre,
} from '../controllers/offreControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getOffres).post(protect, admin, createOffre);
router
  .route('/:id')
  .get(getOffreById)
  .delete(protect, admin, deleteOffre)
  .put(protect, admin, updateOffre);

export default router;
