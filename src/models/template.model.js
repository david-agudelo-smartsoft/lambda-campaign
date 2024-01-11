import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const campaignTemplateSchema = new Schema(
    {
        // Ensure that `channel` is defined with the correct type
        channel: {
            type: String,
            required: false,
          },
        message: {
            type: String,
            required: true,
        },
        externalIntegrationInfo: {
            type: String,
            required: false
        },
        variables: {
            type: [Types.Mixed], // or Types.Array
            required: false,
        },
        project: {
            type: Types.ObjectId,
            required: false,
        },
        type: {
            required: false,
            type: String,
        },
        publicUrl: {
            type: String,
            required: false
        },
        mediaInfo: {
            required: false,
            type: [Types.Mixed], // or Types.Array
        }, 
        idGupshup: {
            type: String,
            required: false
        },
        title: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true,
    }
);

const CampaignTemplate = mongoose.model('CampaignTemplate', campaignTemplateSchema, 'campaign.templates');

export default CampaignTemplate;
