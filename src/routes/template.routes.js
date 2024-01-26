import { Router } from 'express';
import { postTemplateImage,postTemplateText,image,getTemplate,getByUpdateStatus } from '../controllers/template.controller.js';
import multer from 'multer';

const router = Router();

const storage = multer.memoryStorage(); // Almacena el archivo en memoria
  const upload = multer({ storage: storage });

router.post('/template-image', postTemplateImage);
router.post('/template', postTemplateText);
router.post('/image',upload.single('file'),image)
router.post('/templates', getTemplate);
router.post('/status', getByUpdateStatus);

export default router;