import { Router } from 'express';
import { postTemplateImageGupshup,postTemplateTextGupshup,imageGupshup,getTemplateGupshup,getByUpdateStatusGupshup } from '../controllers/template.controller.js';
import multer from 'multer';

const router = Router();

const storage = multer.memoryStorage(); // Almacena el archivo en memoria
const upload = multer({ storage: storage });

router.post('/template-image', postTemplateImageGupshup);
router.post('/template', postTemplateTextGupshup);
router.post('/image',upload.single('file'),imageGupshup)
router.post('/templates', getTemplateGupshup);
router.post('/status', getByUpdateStatusGupshup);
export default router;