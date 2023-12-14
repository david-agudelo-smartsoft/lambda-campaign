import { Router } from 'express';
import { postTemplateImage,postTemplateText } from '../controllers/template.controller.js';
const router = Router();

router.post('/template-image', postTemplateImage);
router.post('/template', postTemplateText);

export default router;