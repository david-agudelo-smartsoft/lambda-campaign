import axios from "axios";
import CampaignTemplate from "../../models/template.model.js";
import Channel from "../../models/channel.model.js";


export const getTemplate = async (req) => {
    try {
        const { idGupshup } = req.body.campaignTemplate;
        const { project } = req.body.campaignTemplate.project;
        const channel = await Channel.find({
          project: `${project}`,
          type: "GUPSHUP",
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
    
          if (externalApiResponse.data.templates.length > 0) {
            let dbResults;
    
            if (idGupshup) {
              dbResults = await CampaignTemplate.find({
                project: `${project}`,
                title: { $regex: new RegExp(idGupshup, "i") },
              });
    
              // Extraer la información necesaria de la segunda plantilla (base de datos)
              const extractedData = dbResults.map(
                ({ message, type, idGupshup, publicUrl, createdAt, updatedAt , title }) => ({
                  message,
                  type,
                  idGupshup,
                  publicUrl,
                  createdAt,
                  title,
                  updatedAt
                })
              );
    
              const unifiedData = externalApiResponse.data.templates.map(
                (template, index) => {
                  const dbTemplate = extractedData.find(
                    (item) => item.idGupshup === template.elementName
                  );
    
                  return {
                    status: template.status,
                    category: template.category,
                    ...dbTemplate,
                  };
                }
              );
    
              const filteredData = unifiedData.filter(
                (template) => template.idGupshup
              );
    
              return {data: filteredData}
              
            } else {
              dbResults = await CampaignTemplate.find({
                project: `${project}`,
              });
    
              // Extraer la información necesaria de la segunda plantilla (base de datos)
              const extractedData = dbResults.map(
                ({ message, type, idGupshup, publicUrl, createdAt, updatedAt, title }) => ({
                  message,
                  type,
                  idGupshup,
                  publicUrl,
                  createdAt,
                  title,
                  updatedAt
                })
              );
    
              const unifiedData = externalApiResponse.data.templates.map(
                (template, index) => {
                  const dbTemplate = extractedData.find(
                    (item) => item.idGupshup === template.elementName
                  );
    
                  return {
                    status: template.status,
                    category: template.category,
                    ...dbTemplate,
                  };
                }
              );
    
              const filteredData = unifiedData.filter(
                (template) => template.idGupshup
              );
    
              return {data: filteredData}
             
            }
          } else {
            console.error("No se encontraron plantillas en la respuesta de la API");
            res.status(404).json({ error: "No se encontraron plantillas" });
          }
        } else {
          console.error("No se encontró el canal para el proyecto especificado");
          res.status(404).json({
            error: "No se encontró el canal para el proyecto especificado",
          });
        }
      } catch (error) {
        console.error(
          "Error al realizar la solicitud al API externo o la base de datos:",
          error
        );
        res.status(500).json({ error: "Error interno del servidor" });
      }
}