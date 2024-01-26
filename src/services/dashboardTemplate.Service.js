import OutboundCampaign from "../models/campaign.model.js";
import { ObjectId } from 'mongodb';
import moment from 'moment-timezone';

export const getDashboardTemplate = async (req) => {
    try {
        const { initDate, finalDate, projectId } = req.body;

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
                        { "project": new ObjectId(projectId) },
                        { createdAt: { $gte: adjustedInitDate.toDate() } },
                        { createdAt: { $lte: adjustedFinalDate.toDate() } },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'campaign.templates',
                    localField: 'campaignTemplate',
                    foreignField: '_id',
                    as: 'templateDoc',
                },
            },
            { $unwind: { path: '$templateDoc' } },
            {
                $lookup: {
                    from: 'outbound.messages',
                    localField: '_id',
                    foreignField: 'outboundCampaign',
                    as: 'messageDoc',
                },
            },
            { $unwind: { path: '$messageDoc' } },
            {
                $addFields: {
                    'eventDoc': {
                        $arrayElemAt: [
                            {
                                $cond: {
                                    if: {
                                        $ne: [
                                            { $size: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'read'] } } } },
                                            0,
                                        ],
                                    },
                                    then: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'read'] } } },
                                    else: {
                                        $cond: {
                                            if: {
                                                $ne: [
                                                    { $size: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'delivered'] } } } },
                                                    0,
                                                ],
                                            },
                                            then: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'delivered'] } } },
                                            else: {
                                                $cond: {
                                                    if: {
                                                        $ne: [
                                                            { $size: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'sent'] } } } },
                                                            0,
                                                        ],
                                                    },
                                                    then: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'sent'] } } },
                                                    else: {
                                                        $cond: {
                                                            if: {
                                                                $ne: [
                                                                    { $size: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'failed'] } } } },
                                                                    0,
                                                                ],
                                                            },
                                                            then: { $filter: { input: '$messageDoc.comments', as: 'comment', cond: { $eq: ['$$comment.event', 'failed'] } } },
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
                $group: {
                    _id: { title: '$templateDoc.title', campaignTemplate: "$templateDoc._id", project: "$templateDoc.project", Fecha: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Bogota' } } },
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: { if: { $eq: ['$messageDoc.status', 'PENDING'] }, then: 1, else: 0 } } },
                    failed: { $sum: { $cond: { if: { $eq: ['$messageDoc.status', 'FAILED_SEND'] }, then: 1, else: 0 } } },
                    send: { $sum: { $cond: { if: { $eq: ['$messageDoc.status', 'SUCCESFULLY_SEND'] }, then: 1, else: 0 } } },
                    channelPending: { $sum: { $cond: { if: { $eq: [{ $ifNull: ['$eventDoc.event', 'pending'] }, 'pending'] }, then: 1, else: 0 } } },
                    channelSent: { $sum: { $cond: { if: { $eq: [{ $ifNull: ['$eventDoc.event', 'pending'] }, 'sent'] }, then: 1, else: 0 } } },
                    channelFailed: { $sum: { $cond: { if: { $eq: [{ $ifNull: ['$eventDoc.event', 'pending'] }, 'failed'] }, then: 1, else: 0 } } },
                    channelDelivered: { $sum: { $cond: { if: { $eq: [{ $ifNull: ['$eventDoc.event', 'pending'] }, 'delivered'] }, then: 1, else: 0 } } },
                    channelRead: { $sum: { $cond: { if: { $eq: [{ $ifNull: ['$eventDoc.event', 'pending'] }, 'read'] }, then: 1, else: 0 } } },
                },
            },
            { $sort: { '_id.Fecha': 1 } },
            {
                $project: {
                    _id: 0,
                    Title: '$_id.title',
                    Fecha: '$_id.Fecha',
                    campaignTemplateId: '$_id.campaignTemplate',
                    projectId: '$_id.project',
                    TOTAL: '$total',
                    PENDING: '$pending',
                    FAILED_SEND: '$failed',
                    SUCCESFULLY_SEND: '$send',
                    CHANELL_PENDING: '$channelPending',
                    CHANELL_FAILED: '$channelFailed',
                    CHANELL_SENT: '$channelSent',
                    CHANELL_DELIVERED: '$channelDelivered',
                    CHANELL_READ: '$channelRead',
                },
            },
        ]);
        return result;
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
