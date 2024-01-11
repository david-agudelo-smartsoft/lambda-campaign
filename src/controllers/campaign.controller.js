import OutboundCampaign from "../models/campaign.model.js";
import { ObjectId } from 'mongodb';
import moment from 'moment-timezone';


export const Detailsmessage = async (req, res) => {
  try {
    const { initDate, finalDate ,projectId,campaignTemplateId } = req.body;

    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
              { "campaignTemplate": new ObjectId(campaignTemplateId) },
              { "project": new ObjectId(projectId)},
              { "updatedAt": { $gte: new Date(initDate) } },
              { "updatedAt": { $lte: new Date(finalDate) } }
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
   
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const DetailsmessageStatus = async (req, res) => {
  try {
    const { initDate, finalDate ,projectId,campaignTemplateId,channelCheck } = req.body;

console.log(req.body)
    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            { "campaignTemplate": new ObjectId(campaignTemplateId) },
            { "project": new ObjectId(projectId)},
            { "updatedAt": { $gte: new Date(initDate) } },
            { "updatedAt": { $lte: new Date(finalDate) } }
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
    

    res.json(filteredResult);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const DashboardTemplate = async (req, res) => {
  try {
    const { initDate, finalDate,projectId } = req.body;

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
          _id: { title: '$templateDoc.title',campaignTemplate :"$templateDoc._id",project:"$templateDoc.project", Fecha: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Bogota' } } },
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
          campaignTemplateId:'$_id.campaignTemplate',
          projectId:'$_id.project',
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

    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
