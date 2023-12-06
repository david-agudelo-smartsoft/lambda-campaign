import { Router } from 'express';
import { getCampaign, getCampaignGroup, postTemplate } from '../controllers/campaign.controller.js'
const router = Router()

router.post('/campaign-dashboard', getCampaign);
router.get('/campaignGroup', getCampaignGroup);
router.post('/template', postTemplate);

export default router