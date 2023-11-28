import { Router } from 'express';
import { getCampaign } from '../controllers/campaign.controller.js'
const router = Router()

router.post('/campaign', getCampaign);


export default router