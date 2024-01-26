import axios from "axios";
import CampaignTemplate from "../../models/template.model.js";
import Channel from "../../models/channel.model.js";

export const getByUpdateStatus = async (req,res) => {
    try {
        const { project } = req.body.campaignTemplate.project;
        const channel = await Channel.find({
          project: `${project}`,
          type: 'GUPSHUP',
        });
    
        if (channel && channel.length > 0) {
          const appname = channel[0].appname;
          const headers = {
            apikey: `${process.env.API_KEY_GUPSHUP}`,
          };
          const externalApiResponse = await axios.get(
            `${process.env.GET_TEMPLATE}${appname}`,
            { headers }
          );
    
          console.log(externalApiResponse.data.templates);
    
          if (externalApiResponse.data.templates.length > 0) {
            let dbResults;
    
            dbResults = await CampaignTemplate.find({
              project: `${project}`,
            });
    
            const extractedData = dbResults.map(
              ({ idGupshup, externalIntegrationInfo }) => ({
                idGupshup,
                externalIntegrationInfo,
              })
            );
    
            for (const template of externalApiResponse.data.templates) {
              const dbTemplate = extractedData.find(
                (item) => item.idGupshup === template.elementName
              );
    
              if (dbTemplate) {
                const { project } = req.body.campaignTemplate.project;
                // Agregar la query de actualización aquí
                await CampaignTemplate.updateOne(
                  {
                    project: `${project}`, // Convierte a ObjectId
                    externalIntegrationInfo: dbTemplate.externalIntegrationInfo,
                  },
                  {
                    $set: {
                      status: template.status,
                    },
                  }
                );
              } else {
                console.error(`No se encontró una plantilla para ${template.elementName}`);
              }
            }
    
            return { message: 'Actualización exitosa' };
          } else {
            return { error: 'No se encontraron plantillas' };
          }
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor' });
      }
};