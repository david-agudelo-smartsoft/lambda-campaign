import OutboundCampaign from "../../models/campaign.model.js";
import { ObjectId } from 'mongodb';
import moment from 'moment-timezone';

export const getDetailsMessageStatus = async (req) => {
    try {
        const { initDate, finalDate, projectId, campaignTemplateId, channelCheck } = req.body;

        // Ajustar la fecha de inicio para comenzar desde las 00:00:00 GMT-5
        const adjustedInitDate = moment(initDate).tz('America/Bogota').startOf('day');
        console.log(adjustedInitDate);

        // Ajustar la fecha final para terminar a las 23:59:59 GMT-5
        const adjustedFinalDate = moment(finalDate).tz('America/Bogota').endOf('day');
        console.log(adjustedFinalDate);

        console.log(req.body);
        const result = await OutboundCampaign.aggregate([
            {
                $match: {
                    $and: [
                        { "campaignTemplate": new ObjectId(campaignTemplateId) },
                        { "project": new ObjectId(projectId) },
                        { "updatedAt": { $gte: adjustedInitDate.toDate() } },
                        { "updatedAt": { $lte: adjustedFinalDate.toDate() } },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "campaign.templates",
                    localField: "campaignTemplate",
                    foreignField: "_id",
                    as: "templateDoc",
                },
            },
            { $unwind: { path: "$templateDoc" } },
            {
                $lookup: {
                    from: "outbound.messages",
                    localField: "_id",
                    foreignField: "outboundCampaign",
                    as: "messageDoc",
                },
            },
            { $unwind: { path: "$messageDoc" } },
            {
                $lookup: {
                    from: "people",
                    localField: "messageDoc.person",
                    foreignField: "_id",
                    as: "peopleDoc",
                },
            },
            { $unwind: { path: "$peopleDoc" } },
            {
                $addFields: {
                    "eventDoc": {
                        $arrayElemAt: [
                            {
                                $cond: {
                                    if: {
                                        $ne: [
                                            { $size: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "read"] } } } },
                                            0,
                                        ],
                                    },
                                    then: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "read"] } } },
                                    else: {
                                        $cond: {
                                            if: {
                                                $ne: [
                                                    { $size: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "delivered"] } } } },
                                                    0,
                                                ],
                                            },
                                            then: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "delivered"] } } },
                                            else: {
                                                $cond: {
                                                    if: {
                                                        $ne: [
                                                            { $size: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "sent"] } } } },
                                                            0,
                                                        ],
                                                    },
                                                    then: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "sent"] } } },
                                                    else: {
                                                        $cond: {
                                                            if: {
                                                                $ne: [
                                                                    { $size: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "failed"] } } } },
                                                                    0,
                                                                ],
                                                            },
                                                            then: { $filter: { input: "$messageDoc.comments", as: "comment", cond: { $eq: ["$$comment.event", "failed"] } } },
                                                            else: [],
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $addFields: {
                    "channelDatetime": {
                        $cond: {
                            if: { $eq: [{ $type: { $toDate: "$eventDoc.timestamp" } }, "date"] },
                            then: {
                                $dateToString: {
                                    format: "%Y-%m-%d %H:%M:%S",
                                    date: { $toDate: "$eventDoc.timestamp" },
                                    timezone: "America/Bogota",
                                },
                            },
                            else: null,
                        },
                    },
                },
            },
            {
                $project: {
                    "_id": 0,
                    "IdContacto": "$messageDoc.person",
                    "channel": "$channel",
                    "numberCountryCode": "$peopleDoc.numberCountryCode",
                    "phoneNumber": "$peopleDoc.phoneNumber",
                    "fullName": "$peopleDoc.fullName",
                    "datetimeMessage": "$messageDoc.updatedAt",
                    "statusMessage": "$messageDoc.status",
                    "channelCheck": {
                        $cond: {
                            if: { $eq: ["$messageDoc.status", "SUCCESFULLY_SEND"] },
                            then: { "$ifNull": ["$eventDoc.event", "pending"] },
                            else: "N/A",
                        },
                    },
                    "channelError": {
                        $cond: {
                            if: { $eq: ["$eventDoc.event", "failed"] },
                            then: "$eventDoc.error",
                            else: "N/A",
                        },
                    },
                    "channelDestination": {
                        $cond: {
                            if: { $eq: ["$messageDoc.status", "SUCCESFULLY_SEND"] },
                            then: { "$ifNull": ["$eventDoc.destination", "pending"] },
                            else: "N/A",
                        },
                    },
                    "channelDatetime": {
                        $cond: {
                            if: { $eq: ["$messageDoc.status", "SUCCESFULLY_SEND"] },
                            then: "$channelDatetime",
                            else: "N/A",
                        },
                    },
                    "titleTemplate": "$templateDoc.title",
                    "IdCampana": "$_id",
                    "createdAtCampaing": "$createdAt",
                    "statusCampaing": "$state",
                },
            },
        ]);
        let filteredResult = result;
        if (channelCheck) {
            const allowedChannelChecks = Array.isArray(channelCheck) ? channelCheck : [channelCheck.toLowerCase()];
            filteredResult = filteredResult.filter(item => allowedChannelChecks.includes(item.channelCheck.toLowerCase()));
        }
        return filteredResult;
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};