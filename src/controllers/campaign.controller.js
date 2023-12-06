import OutboundCampaign from "../models/campaign.model.js";
import { ObjectId } from "mongodb";
import qs from 'querystring'
import axios from 'axios'

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


export const postTemplate = async (req, requestData) => {
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
      mediaId,
      exampleMedia,
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

    const requestBody = qs.stringify(requestData);

    const apiResponse = await axios.post(
      'https://api.gupshup.io/wa/app/e16ef554-0930-4b6e-88bd-6e948ce5f78a/template',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': 'bbcms7lbqmxe70qy89kj1jxcfmnjfaze',
        },  
      }
    );


    if (apiResponse.data.status === 'success') {
      const firstApiTemplateId = apiResponse.data.template.id;
      const contentFromReqBody = apiResponse.data.template.data
    
      // Puedes enviar la respuesta a otra API aquí
      const secondApiResponse = await axios.post(
        'https://agentechatdevmgt.smartsoft.com.co:3000/campaign-templates',
        {
          campaignTemplate: {
            channel: "GUPSHUP",
            type: "TEXT",
            message: ` ${contentFromReqBody}`,
            project:'60ad701657b4fe0013d4d6ec', // Usa el id del primer API response como project
            externalIntegrationInfo: {
              id: firstApiTemplateId,
              params: [
                "Pruebas",
                "pruebas@correo.com"
              ]
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTI0NjZiNzkzOGEyZDAwMTM4NjQzM2EiLCJuYW1lIjp7ImZpcnN0TmFtZSI6ImFkbWluIiwibGFzdE5hbWUiOiIyIn0sInJvbGUiOiJBRE1JTiIsImNvbXBhbnkiOiI2MGFkNzAxNjU3YjRmZTAwMTNkNGQ2ZTkiLCJsYXN0TG9naW4iOiIyMDIzLTEyLTA1VDE2OjM3OjU3Ljc1NFoiLCJmaXJzdExvZ2luIjpmYWxzZSwiaWF0IjoxNzAxNzk0Mjc3LCJleHAiOjE3MDE4ODA2Nzd9.RX6ThUpvmjrci19ao7HYFYcL8LvhAe0MEzJwfCF4JpI'
            // Otras cabeceras necesarias para la segunda API
          },
        }
      );
    
      console.log(secondApiResponse.data);
    } else {
      console.error('La primera API respondió con un error:', apiResponse.data.error);
    }
  
  } catch (error) {
    console.error('Error al realizar la solicitud a la API externa:', error);
    throw new Error('Error interno del servidor: ' + error.message);
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


