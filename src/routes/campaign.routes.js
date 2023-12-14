import { Router } from 'express';
import { getCampaign, getCampaignGroup } from '../controllers/campaign.controller.js'
const router = Router()

router.post('/campaign-dashboard', getCampaign);
router.get('/campaignGroup', getCampaignGroup);


export default router