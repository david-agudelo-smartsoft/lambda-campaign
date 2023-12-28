import { Router } from 'express';
import { getCampaign, getCampaignGroup,Detailsmessage,DashboardTemplate,DetailsmessageStatus } from '../controllers/campaign.controller.js'
const router = Router()

router.post('/campaign-dashboard', getCampaign);
router.post('/Detailsmessage', Detailsmessage);
router.post('/DetailsmessageStatus', DetailsmessageStatus);
router.post('/Dashboardtemplate', DashboardTemplate);
router.get('/campaignGroup', getCampaignGroup);


export default router