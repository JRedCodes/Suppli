/**
 * Onboarding routes
 */

import { Router } from 'express';
import { verifyJWT } from '../middleware';
import {
  initializeUserHandler,
  getUserBusinessesHandler,
} from '../controllers/onboarding.controller';

const router = Router();

// All onboarding routes require authentication
router.use(verifyJWT);

// Initialize new user (create business and membership)
router.post('/initialize', initializeUserHandler);

// Get user's businesses
router.get('/businesses', getUserBusinessesHandler);

export default router;
