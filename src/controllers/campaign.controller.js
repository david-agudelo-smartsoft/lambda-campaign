import { getDashboardTemplate } from "../services/campaign.services/dashboardTemplate.Service.js";
import { getDetailsMessage } from "../services/campaign.services/detailsMessage.Service.js";
import { getDetailsMessageStatus } from "../services/campaign.services/detailsMessageStatus.Service.js";


export const Detailsmessage = async (req, res) => {
  try {
    const result = await getDetailsMessage(req);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const DetailsmessageStatus = async (req, res) => {
  try {
    const result = await getDetailsMessageStatus(req);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const DashboardTemplate = async (req, res) => {
  try {
    const result = await getDashboardTemplate(req);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
