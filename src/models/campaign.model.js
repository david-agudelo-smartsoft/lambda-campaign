import mongoose from 'mongoose';

const outboundCampaignSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    updatedAt: {
        type: Date,
        required: true,
    },
    campaignTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    OutboundMessage: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    Interaction: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
});

const OutboundCampaign = mongoose.model('OutboundCampaign', outboundCampaignSchema, 'outbound.campaigns');

export default OutboundCampaign;