import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const channelSchema = new Schema(
    {
       
        project: {
            type: Types.ObjectId,
            required: false,
        },
        key: {
            type: String
        },
        type: {
            type:[Types.Mixed],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        client: {
            type: String,
            required: true
        },
        params: {
            type: [Types.Mixed]
        },
        mode: {
            type: [Types.Mixed],
            required: true
        },
        status: {
            type: String
        },
        appname:{
            type: String,
            required: false
        },
        subtype:{
            type: String,
            required: false
        },
        appIdGushup:{
            type: String,
            required: false
        },
    },
    {
        timestamps: true,
    }
              
);

const Channel = mongoose.model('Channel', channelSchema, 'channels');

export default Channel;