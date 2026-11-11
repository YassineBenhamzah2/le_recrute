import express from 'express';
import {
  getEntreprises,
  getEntrepriseById,
  createEntreprise,
  updateEntreprise,
} from '../controllers/entrepriseControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getEntreprises).post(protect, admin, createEntreprise);
router.route('/:id').get(getEntrepriseById).put(protect, admin, updateEntreprise);

export default router;
