import OutboundCampaign from "../models/campaign.model.js";
import { ObjectId } from "mongodb";

export const getCampaignGroup = async (req, res) => {
  try {
    const { initDate, finalDate } = req.body;

    const result = await OutboundCampaign.aggregate([
      {
        $match: {
          $and: [
            { "updatedAt": { $gte: new Date(initDate) } },
            { "updatedAt": { $lte: new Date(finalDate) } },
            // { "project": new ObjectId(projectId) },
          ]
        }
      },
      {
        $lookup: {
          from: 'campaign.templates',
          localField: 'campaignTemplate',
          foreignField: '_id',
          as: 'templateDoc'
        }
      }, { $unwind: { path: '$templateDoc' } },
      {
        $lookup: {
          from: 'outbound.messages',
          localField: '_id',
          foreignField: 'outboundCampaign',
          as: 'messageDoc'
        }
      }, { $unwind: { path: '$messageDoc' } },
      {
        $lookup: {
          from: 'interactions',
          localField: 'messageDoc.interactionId',
          foreignField: '_id',
          as: 'interactionDoc'
        }
      }, { $unwind: { path: '$interactionDoc', preserveNullAndEmptyArrays: true } },
      {
        $group:
        {
          _id: { title: "$templateDoc.title", Fecha: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "America/Bogota" } } },
          total: { $sum: 1 },
          send: { $sum: { $cond: { if: { $eq: ["$messageDoc.status", "SUCCESFULLY_SEND"] }, then: 1, else: 0 } } },
          check: { $sum: { $cond: { if: { $eq: ["$interactionDoc.delivered", true] }, then: 1, else: 0 } } },
          pending: { $sum: { $cond: { if: { $eq: ["$messageDoc.status", "PENDING"] }, then: 1, else: 0 } } },
          failed: { $sum: { $cond: { if: { $eq: ["$messageDoc.status", "FAILED_SEND"] }, then: 1, else: 0 } } }
        }
      },
      { $sort: { "_id.Fecha": 1 } },
      {
        $project: {
          "_id": 0,
          "Title": "$_id.title",
          "Fecha": "$_id.Fecha",
          "TOTAL": "$total",
          "PENDING": "$pending",
          "SUCCESFULLY_SEND": "$send",
          "FAILED_SEND": "$failed",
          "CHECK": "$check",
        }
      }

    ]).limit(20);

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
            { "updatedAt": { $gte: new Date(initDate) } },
            { "updatedAt": { $lte: new Date(finalDate) } },
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
    ])

    res.json(result);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTemplateText = async (req, res) => {

  try {

  const {
    languageCode,
    content,
    category,
    templateType,
    elementName,
    exampleHeader,
    example,
    vertical,
  } = req.body;

  const requestData = {
    languageCode,
    content,
    category,
    templateType,
    elementName,
    exampleHeader,
    example,
    vertical,
    mediaId,
    exampleMedia,
  };

  
  console.log(req.body);
  const requestBody = qs.stringify(requestData);
  
  // Realizar la solicitud a la API externa utilizando Axios
  const apiResponse = await axios.post(
    'https://api.gupshup.io/wa/app/e16ef554-0930-4b6e-88bd-6e948ce5f78a/template',
    requestBody,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': 'bbcms7lbqmxe70qy89kj1jxcfmnjfaze'
      }
    }
  );

  res.json(200),(apiResponse.data)
    
  } catch (error) {

    console.error('Error al realizar la solicitud a la API externa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    
  }

}