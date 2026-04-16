import express from 'express';
import searchController from '../controllers/SearchController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Global search endpoint
router.get('/', authMiddleware, (req, res) =>
    searchController.globalSearch(req, res)
);

export default router;
