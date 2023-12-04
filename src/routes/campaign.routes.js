import { Router } from 'express';
import { getCampaign, getCampaignGroup, createTemplateText } from '../controllers/campaign.controller.js'
const router = Router()

router.post('/campaign-dashboard', getCampaign);
router.get('/campaignGroup', getCampaignGroup);
router.post('/template', createTemplateText);

export default router