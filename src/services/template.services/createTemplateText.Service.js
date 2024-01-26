import axios from "axios";
import Channel from "../../models/channel.model.js";
import Template from "../../models/template.model.js";

export const postTemplateText = async (req, res) => {
    try {
        const { project } = req.body.campaignTemplate.project;
        const db = await Channel.find({ project: `${project}`, type: "GUPSHUP" });
        const id = db[0].appIdGushup;
        const { idGupshup, title } = req.body.campaignTemplate.variables;
    
        // Verificar si el idGupshup ya existe en la base de datos
        const existingIdGupshup = await Template.findOne({ idGupshup });
    
        if (existingIdGupshup) {
          return {
            success: false,
            message:
              "El idGupshup ya existe en la base de datos. No se puede enviar la plantilla a Gupshup.",
          };
        }
    
        // Verificar si el title ya existe en la base de datos
        const existingTitle = await Template.findOne({ title });
    
        if (existingTitle) {
          return {
            success: false,
            message:
              "El title ya existe en la base de datos. No se puede enviar la plantilla a Gupshup.",
          };
        }
    
        const {
          languageCode,
          content,
          category,
          templateType,
          elementName,
          exampleHeader,
          example,
          vertical,
          allowTemplateCategoryChange,
        } = req.body.campaignTemplate.variables;
    
        const apiResponse = await axios.post(
          `https://api.gupshup.io/wa/app/${id}/template`,
          {
            languageCode,
            content,
            category,
            templateType,
            elementName,
            exampleHeader,
            example,
            vertical,
            allowTemplateCategoryChange,
          },
    
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              apikey: `${process.env.API_KEY_GUPSHUP}`,
            },
          }
        );
    
        console.log(apiResponse.data);
    
        if (apiResponse.data.status !== "success") {
          return {
            success: false,
            message: apiResponse.data.message,
          };
        }
    
        if (apiResponse.data.status === "success") {
          const firstApiTemplateId = apiResponse.data.template.id;
          const contentFromReqBody = apiResponse.data.template.data;
    
          const { project } = req.body.campaignTemplate.project;
          const { title } = req.body.campaignTemplate.variables;
          const { idGupshup } = req.body.campaignTemplate.variables;
          const token = req.body.campaignTemplate.token;
    
          // Puedes enviar la respuesta a otra API aquí
          const secondApiResponse = await axios.post(
            `${process.env.AGENTE_CHAT}`,
            {
              campaignTemplate: {
                channel: "GUPSHUP",
                type: "TEXT",
                message: ` ${contentFromReqBody}`,
                project: `${project}`, // Usa el id del primer API response como project
                externalIntegrationInfo: {
                  id: firstApiTemplateId,
                  params: ["Pruebas", "pruebas@correo.com"],
                },
                title: `${title}`,
                idGupshup: `${idGupshup}`,
                status: `PENDING`,
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
                // Otras cabeceras necesarias para la segunda API
              },
            }
          );
    
          console.log("La segunda API respondió:", secondApiResponse.data);
          return {
            success: true,
            message: "Plantilla creada correctamente",
          };
        } else {
          return {
            success: false,
            message: "Error al crear la plantilla",
          };
        }
      } catch (error) {
        console.error("Error al realizar la solicitud a la API externa:", error);
      }
}