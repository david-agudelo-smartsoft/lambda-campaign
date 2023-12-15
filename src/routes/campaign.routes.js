import { Router } from 'express';
import { getCampaignGroup, getCampaignDetails } from '../controllers/campaign.controller.js'
const router = Router()

// router.post('/campaign-dashboard', getCampaign);
router.post('/campaignGroup', getCampaignGroup);
router.post('/campaignDetails', getCampaignDetails);


export default router