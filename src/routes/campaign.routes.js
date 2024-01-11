import { Router } from 'express';
import {Detailsmessage,DashboardTemplate,DetailsmessageStatus } from '../controllers/campaign.controller.js'
const router = Router()


router.post('/Detailsmessage', Detailsmessage);
router.post('/DetailsmessageStatus', DetailsmessageStatus);
router.post('/Dashboardtemplate', DashboardTemplate);



export default router