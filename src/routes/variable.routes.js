import { Router } from 'express';
import { getVariablePeople } from '../controllers/variable.controller.js';

const router = Router();

router.get('/people', getVariablePeople);
export default router;