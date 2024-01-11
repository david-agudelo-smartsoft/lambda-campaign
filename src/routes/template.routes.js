import { Router } from 'express';
import { postTemplateImage,postTemplateText,image,getTemplate } from '../controllers/template.controller.js';
import multer from 'multer';
import path from 'path';


const router = Router();

const storage = multer.diskStorage({
    destination: function (req, _file, cb) {
     return cb(null, './uploads'); // Carpeta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
      return cb(null,`clone_${file.originalname}`) // Nombre del archivo con marca de tiempo para evitar conflictos de nombres
    },
  });
  
  const upload = multer({ storage: storage });
  

router.post('/template-image', postTemplateImage);
router.post('/template', postTemplateText);
router.post('/image',upload.single('image'),image)
router.post('/templates', getTemplate);

export default router;