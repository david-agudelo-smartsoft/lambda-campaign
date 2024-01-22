import axios from "axios";
import CampaignTemplate from "../models/template.model.js";
import Channel from "../models/channel.model.js";
import { Blob } from "buffer";
import { S3Uploader } from "../services/s3.service.js";

export const postTemplateText = async (req,res) => {
  try {
    const { project } = req.body.campaignTemplate.project;
    const db = await Channel.find({ project: `${project}`, type: "GUPSHUP" });
    const id = db[0].appIdGushup;
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
      return({
        success: false,
        message: apiResponse.data.message
      });
    }

    if (apiResponse.data.status ==="success") {
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
       return ({
        success: true,
        message: "Plantilla creada correctamente"});
    } 

    else{
     return ({
      success: false,
      message: "Error al crear la plantilla"});
    }

  } catch (error) {
    console.error("Error al realizar la solicitud a la API externa:", error);
  }
};

export const image = async (req, res) => {
  try {
    const project = req.body;
    const body = project.jsonBody;
    const db = await Channel.find({ project: `${body}`, type: "GUPSHUP" });
    const id = db[0].appIdGushup.toString(); // Conviértelo a cadena si aún no lo es
    const file = req.file;
    const formData = new FormData();
    formData.append("file_length", file.size);
    formData.append("file_type", file.mimetype);

    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob, { filename: file.originalname });

    // Cambia la URL de la segunda API según tu configuración
    const secondApiUrl = `https://api.gupshup.io/wa/${id}/wa/media/`; // Reemplaza con la URL de la segunda API

    // Enviar la solicitud a la segunda API
    const response = await axios.post(secondApiUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        apikey: `${process.env.API_KEY_GUPSHUP}`,
        // Agrega cualquier otro encabezado necesario para la segunda API
      },
    });

    // Puedes enviar una respuesta al frontend si es necesario
    const s3Uploader = new S3Uploader();
    const s3Response = await s3Uploader.uploadFile(file);
    res.json({ mediaId: response.data.mediaId, urlAWS: s3Response.Location });
  } catch (error) {
    console.error("Error al subir la imagen al backend:", error);
    res.status(500).send("Hubo un error al subir la imagen al backend.");
  }
};

export const postTemplateImage = async (req) => {
  try {
    const { project } = req.body.campaignTemplate.project;
    const db = await Channel.find({ project: `${project}`, type: "GUPSHUP" });
    const id = db[0].appIdGushup;
    console.log(id);
    const idImage = req.body.campaignTemplate.variables.mediaId;
    const apiImage = await axios.get(
      `https://api.gupshup.io/wa/${id}/wa/media/${idImage}?download=false`
    );

    if (apiImage.status === 200) {
      const {
        languageCode,
        content,
        category,
        templateType,
        elementName,
        example,
        vertical,
        allowTemplateCategoryChange,
        exampleMedia,
        mediaId,
        exampleHeader,
      } = req.body.campaignTemplate.variables;

      console.log(req.body.campaignTemplate.variables);

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
          exampleMedia,
          mediaId,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            apikey: `${process.env.API_KEY_GUPSHUP}`,
          },
        }
      );

      console.log(apiResponse.data);

      if(apiResponse.data.status !== "success") {
        return {
          success: false,
          message: "Failed to post template image",
        };
      }

      if (apiResponse.data.status === "success") {
        const firstApiTemplateId = apiResponse.data.template.id;
        const contentFromReqBody = apiResponse.data.template.data;
        const token = req.body.campaignTemplate.token;
        const { project } = req.body.campaignTemplate.project;
        const { title } = req.body.campaignTemplate.variables;
        const { idGupshup } = req.body.campaignTemplate.variables;
        const url = req.body.campaignTemplate.url;

        const secondApiResponse = await axios.post(
          `${process.env.AGENTE_CHAT}`,
          {
            campaignTemplate: {
              channel: "GUPSHUP",
              type: "IMAGE",
              message: ` ${contentFromReqBody}`,
              project: `${project}`,
              url: `${url}`,
              externalIntegrationInfo: {
                id: firstApiTemplateId,
                params: ["Pruebas", "pruebas@correo.com"],
              },
              title: `${title}`,
              idGupshup: `${idGupshup}`,
              publicUrl: `${url}`,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        console.log("La segunda API respondió:", secondApiResponse.data);

        return {
          success: true,
          message: "Template image posted successfully",
        };
      } else {
        console.error(
          "La primera API respondió con un error:",
          apiResponse.data.error
        );
        return {
          success: false,
          message: "Failed to post template image",
          error: apiResponse.data.error,
        };
      }
    } else {
      console.error(
        "La primera API respondió con un error:",
        apiImage.data.error
      );
      return {
        success: false,
        message: "Failed to retrieve image from GUPSHUP API",
        error: apiImage.data.error,
      };
    }
  } catch (error) {
    console.error("Error al realizar la solicitud a la API externa:", error);
    throw new Error("Error interno del servidor: " + error.message);
  }
};

export const getTemplate = async (req, res) => {
  try {
    const { idGupshup } = req.body.campaignTemplate;
    const { project } = req.body.campaignTemplate.project;
    const channel = await Channel.find({
      project: `${project}`,
      type: "GUPSHUP",
    });

    if (channel && channel.length > 0) {
      const appname = channel[0].appname;
      console.log(appname);
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
            ({ message, type, idGupshup, publicUrl, createdAt, title }) => ({
              message,
              type,
              idGupshup,
              publicUrl,
              createdAt,
              title,
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

          console.log(filteredData);

          res.json({
            data: filteredData,
          });
        } else {
          dbResults = await CampaignTemplate.find({
            project: `${project}`,
          });

          // Extraer la información necesaria de la segunda plantilla (base de datos)
          const extractedData = dbResults.map(
            ({ message, type, idGupshup, publicUrl, createdAt, title }) => ({
              message,
              type,
              idGupshup,
              publicUrl,
              createdAt,
              title,
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

          res.json({
            data: filteredData,
          });
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
};
