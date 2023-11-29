import { Router } from 'express';
import { getCampaign, getCampaignGroup } from '../controllers/campaign.controller.js'
const router = Router()

router.get('/campaign', getCampaign);
router.get('/campaignGroup', getCampaignGroup);


export default router