import OutboundCampaign from "../models/campaign.model.js";


export const Detailsmessage = async (req, res) => {
  try {
    const { initDate, finalDate,IdCampana  } = req.body;

    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            { createdAt: { $gte: new Date(initDate) } },
            { createdAt: { $lte: new Date(finalDate) } },
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

    if (IdCampana) {
      filteredResult = filteredResult.filter(item => item.IdCampana == IdCampana);
    }
    res.json(filteredResult);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const DetailsmessageStatus = async (req, res) => {
  try {
    const { initDate, finalDate, IdCampana, channelCheck } = req.body;

console.log(req.body)
    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            { createdAt: { $gte: new Date(initDate) } },
            { createdAt: { $lte: new Date(finalDate) } },
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

    if (IdCampana) {
      filteredResult = filteredResult.filter(item => item.IdCampana == IdCampana);
    }
    
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

    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            {projectId  :projectId},
            { createdAt: { $gte: new Date(initDate) } },
            { createdAt: { $lte: new Date(finalDate) } },
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
          _id: { title: '$templateDoc.title', Fecha: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Bogota' } } },
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

export const getCampaignGroup = async (req, res) => {
  try {
    const { initDate, finalDate } = req.body;

    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            { updatedAt: { $gte: new Date(initDate) } },
            { updatedAt: { $lte: new Date(finalDate) } },
            // { "project": new ObjectId(projectId) },
          ],
        },
      },
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
        $addFields: { eventDoc: { $arrayElemAt: ["$messageDoc.comments", 0] } },
      },
      {
        $group: {
          _id: {
            title: "$templateDoc.title",
            Fecha: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "America/Bogota",
              },
            },
          },
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: {
                if: { $eq: ["$messageDoc.status", "PENDING"] },
                then: 1,
                else: 0,
              },
            },
          },
          failed: {
            $sum: {
              $cond: {
                if: { $eq: ["$messageDoc.status", "FAILED_SEND"] },
                then: 1,
                else: 0,
              },
            },
          },
          send: {
            $sum: {
              $cond: {
                if: { $eq: ["$messageDoc.status", "SUCCESFULLY_SEND"] },
                then: 1,
                else: 0,
              },
            },
          },
          channelPending: {
            $sum: {
              $cond: {
                if: {
                  $eq: [{ $ifNull: ["$eventDoc.event", "pending"] }, "pending"],
                },
                then: 1,
                else: 0,
              },
            },
          },
          channelSent: {
            $sum: {
              $cond: {
                if: {
                  $eq: [{ $ifNull: ["$eventDoc.event", "pending"] }, "sent"],
                },
                then: 1,
                else: 0,
              },
            },
          },
          channelFailed: {
            $sum: {
              $cond: {
                if: {
                  $eq: [{ $ifNull: ["$eventDoc.event", "pending"] }, "failed"],
                },
                then: 1,
                else: 0,
              },
            },
          },
          channelDelivered: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    { $ifNull: ["$eventDoc.event", "pending"] },
                    "delivered",
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
          channelRead: {
            $sum: {
              $cond: {
                if: {
                  $eq: [{ $ifNull: ["$eventDoc.event", "pending"] }, "read"],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      { $sort: { "_id.Fecha": 1 } },
      {
        $project: {
          _id: 0,
          Title: "$_id.title",
          Fecha: "$_id.Fecha",
          TOTAL: "$total",
          PENDING: "$pending",
          FAILED_SEND: "$failed",
          SUCCESFULLY_SEND: "$send",
          CHANELL_PENDING: "$channelPending",
          CHANELL_SENT: "$channelSent",
          CHANELL_FAILED: "$channelFailed",
          CHANELL_DELIVERED: "$channelDelivered",
          CHANELL_READ: "$channelRead",
        },
      },
    ]).limit(20);
    const { idCampana, channelCheck } = req.body;
    let filteredResult = result;

    if (idCampana) {
      filteredResult = filteredResult.filter(item => item.IdCampana === idCampana);
    }

    if (channelCheck) {
      filteredResult = filteredResult.filter(item => item.channelCheck === channelCheck);
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCampaign = async (req, res) => {
  try {
    const { initDate, finalDate } = req.body;

    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            { updatedAt: { $gte: new Date(initDate) } },
            { updatedAt: { $lte: new Date(finalDate) } },
            // {"project": new ObjectId(projectId)},
          ],
        },
      },
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
          from: "interactions",
          localField: "messageDoc.interactionId",
          foreignField: "_id",
          as: "interactionDoc",
        },
      },
      {
        $unwind: { path: "$interactionDoc", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            title: "$templateDoc.title",
            Campana: "$_id",
            Fecha: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$createdAt",
                timezone: "America/Bogota",
              },
            },
          },
          total: { $sum: 1 },
          send: {
            $sum: {
              $cond: {
                if: { $eq: ["$messageDoc.status", "SUCCESFULLY_SEND"] },
                then: 1,
                else: 0,
              },
            },
          },
          check: {
            $sum: {
              $cond: {
                if: { $eq: ["$interactionDoc.delivered", true] },
                then: 1,
                else: 0,
              },
            },
          },
          pending: {
            $sum: {
              $cond: {
                if: { $eq: ["$messageDoc.status", "PENDING"] },
                then: 1,
                else: 0,
              },
            },
          },
          failed: {
            $sum: {
              $cond: {
                if: { $eq: ["$messageDoc.status", "FAILED_SEND"] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      { $sort: { "_id.Fecha": -1 } },
      {
        $project: {
          _id: 0,
          Title: "$_id.title",
          IdCampana: "$_id.Campana",
          Fecha: "$_id.Fecha",
          TOTAL: "$total",
          PENDING: "$pending",
          SUCCESFULLY_SEND: "$send",
          FAILED_SEND: "$failed",
          CHECK_CHANNEL: "$check",
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
