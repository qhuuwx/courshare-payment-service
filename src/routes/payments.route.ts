import { Router } from 'express';
import {createPayment} from '../controllers/payments.controller';

const router = Router();
router.post("/", createPayment);
export default router;