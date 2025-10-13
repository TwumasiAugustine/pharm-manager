/**
 * Health Routes
 * Routes for system health and status endpoints
 */

import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Get system health status
 * @access  Public
 */
router.get('/', healthController.getSystemHealth);

/**
 * @route   GET /api/health/ping
 * @desc    Simple ping endpoint for connectivity checks
 * @access  Public
 */
router.get('/ping', healthController.ping);

export default router;
