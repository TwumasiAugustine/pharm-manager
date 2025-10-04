import express from 'express';
import { transferStock } from '../controllers/stock.controller';

const router = express.Router();

router.post('/transfer', transferStock);

export default router;
