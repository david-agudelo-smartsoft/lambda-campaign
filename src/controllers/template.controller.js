import axios from "axios";
import qs from "querystring";
import fs from "fs";
import CampaignTemplate from "../models/template.model.js";
import Channel from "../models/channel.model.js";
import e from "express";

export const postTemplateText = async (req) => {
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
      allowTemplateCategoryChange,
    } = req.body.campaignTemplate.variables;
    console.log(req.body.campaignTemplate.variables);

    const apiResponse = await axios.post(
      "https://api.gupshup.io/wa/app/e16ef554-0930-4b6e-88bd-6e948ce5f78a/template",
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
          apikey: "bbcms7lbqmxe70qy89kj1jxcfmnjfaze",
        },
      }
    );

    console.log(apiResponse.data);

    if (apiResponse.data.status === "success") {
      const firstApiTemplateId = apiResponse.data.template.id;
      const contentFromReqBody = apiResponse.data.template.data;

      const { project } = req.body.campaignTemplate.project;
      const { title } = req.body.campaignTemplate.variables;
      const { idGupshup } = req.body.campaignTemplate.variables;
      const token = req.body.campaignTemplate.token;

      // Puedes enviar la respuesta a otra API aquí
      const secondApiResponse = await axios.post(
        "https://agentechatdevmgt.smartsoft.com.co:3000/campaign-templates",
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

      console.log("La segunda API respondió:", secondApiResponse);
    } else {
    }
  } catch (error) {
    console.error("Error al realizar la solicitud a la API externa:", error);
    throw new Error("Error interno del servidor: " + error.message);
  }
};

export const image = async (req) => {
  try {
    const image = req.file;
    console.log("image", image);

    const api = await axios.post(
      "https://api.gupshup.io/wa/e16ef554-0930-4b6e-88bd-6e948ce5f78a/wa/media",
      { image },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apikey: "bbcms7lbqmxe70qy89kj1jxcfmnjfaze",
        },
      }
    );

    console.log(api.data);
  } catch (error) {
    console.error("Error al realizar la solicitud a la API externa:", error);
    throw new Error("Error interno del servidor: " + error.message);
  }
};

export const postTemplateImage = async (req, requestData) => {
  try {
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
    } = req.body;
    console.log(req.body);

    const apiResponse = await axios.post(
      "https://api.gupshup.io/wa/app/e16ef554-0930-4b6e-88bd-6e948ce5f78a/template",
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
          apikey: "bbcms7lbqmxe70qy89kj1jxcfmnjfaze",
        },
      }
    );

    console.log(apiResponse.data);

    if (apiResponse.data.status === "success") {
      const firstApiTemplateId = apiResponse.data.template.id;
      const contentFromReqBody = apiResponse.data.template.data;

      // Puedes enviar la respuesta a otra API aquí
      const secondApiResponse = await axios.post(
        "https://agentechatdevmgt.smartsoft.com.co:3000/campaign-templates",
        {
          campaignTemplate: {
            channel: "GUPSHUP",
            type: "TEXT",
            message: ` ${contentFromReqBody}`,
            project: "60ad701657b4fe0013d4d6ec", // Usa el id del primer API response como project
            externalIntegrationInfo: {
              id: firstApiTemplateId,
              params: ["Pruebas", "pruebas@correo.com"],
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTI0NjZiNzkzOGEyZDAwMTM4NjQzM2EiLCJuYW1lIjp7ImZpcnN0TmFtZSI6ImFkbWluIiwibGFzdE5hbWUiOiIyIn0sInJvbGUiOiJBRE1JTiIsImNvbXBhbnkiOiI2MGFkNzAxNjU3YjRmZTAwMTNkNGQ2ZTkiLCJsYXN0TG9naW4iOiIyMDIzLTEyLTE0VDE5OjIxOjI4LjM0MloiLCJmaXJzdExvZ2luIjpmYWxzZSwiaWF0IjoxNzAyNTgxNjg4LCJleHAiOjE3MDI2NjgwODh9.B_un2PGniztHFO9Ie3fYX3knQwh5KZDB3AknHvC8Alk",
            // Otras cabeceras necesarias para la segunda API
          },
        }
      );
    } else {
      console.error(
        "La primera API respondió con un error:",
        apiResponse.data.error
      );
    }
  } catch (error) {
    console.error("Error al realizar la solicitud a la API externa:", error);
    throw new Error("Error interno del servidor: " + error.message);
  }
};

export const getTemplate = async (req, res) => {
  try {
    const { page, pageSize, idGupshup } = req.body.campaignTemplate;
    const { project } = req.body.campaignTemplate.project;
    // Obtener el canal correspondiente al proyecto
    const channel = await Channel.find({
      project: `${project}`,
      type: "GUPSHUP",
    });

    // Verificar si se encontró el canal
    if (channel && channel.length > 0) {
      const appname = channel[0].appname;
      const apikey = "bbcms7lbqmxe70qy89kj1jxcfmnjfaze";
      const headers = {
        apikey: apikey,
      };

      // Obtener plantillas externas
      const externalApiResponse = await axios.get(
        `https://api.gupshup.io/sm/api/v1/template/list/${appname}`,
        { headers }
      );

      // Verificar si hay al menos una plantilla en la respuesta
      if (externalApiResponse.data.templates.length > 0) {
        // Obtener resultados de la base de datos con filtro por título
        let dbResults;
        if (idGupshup) {
          dbResults = await CampaignTemplate.find({
            project: `${project}`,
            idGupshup: { $regex: new RegExp(idGupshup, "i") },
          }).sort({createdAt: -1});

          // Paginación: Obtén parámetros de la solicitud
          const startIndex = (page - 1) * pageSize;
          const endIndex = page * pageSize;
          
          // Verificar límites de los índices
          const validStartIndex = Math.max(0, Math.min(startIndex, dbResults.length - 1));
          const validEndIndex = Math.max(0, Math.min(endIndex, dbResults.length));

          // Extraer la información necesaria de la segunda plantilla (base de datos)
          const extractedData = dbResults
            .slice(validStartIndex, validEndIndex)
            .map(({ message, type, idGupshup, publicUrl, createdAt }) => ({
              message,
              type,
              idGupshup,
              publicUrl,
              createdAt,
            }))
          
          // Obtener todos los valores de 'status' y 'category' de la API externa
          const allStatusValues = externalApiResponse.data.templates.map(
            (template) => template.status
          );
          const allCategories = externalApiResponse.data.templates.map(
            (template) => template.category
          );

          const allAppId = externalApiResponse.data.templates.map(
            (template) => template.appId
          );
          

          // Validación: si el tipo es IMAGE, realizar operación específica
          const imageTemplates = extractedData.filter(
            (template) => template.type === "IMAGE"
          );

          if (imageTemplates.length > 0) {
            // Realizar operación específica si hay plantillas de tipo IMAGE
            imageTemplates.forEach((imageTemplate) => {
              // Lógica específica para plantillas de tipo IMAGE
            });
          }

          // Unificar la información de la API externa y la base de datos
          const unifiedData = externalApiResponse.data.templates.map(
            (template, index) => ({
              appId: allAppId[index],
              status: allStatusValues[index],
              category: allCategories[index],
              ...extractedData[index],
            })
          );

          // Filtrar objetos sin la propiedad 'message'
          const filteredData = unifiedData.filter(
            (template) => template.message !== undefined
          );

          console.log("filteredData", filteredData);
          // Puedes enviar la información filtrada y paginada en la respuesta si es necesario
          res.json({
            data: filteredData,
            pagination: {
              page,
              pageSize,
              totalPages: Math.ceil(dbResults.length / pageSize),
            },
          });
        } else {
          dbResults = await CampaignTemplate.find({
            project: `${project}`,
          }).sort({createdAt: -1});

          // Paginación: Obtén parámetros de la solicitud
          const startIndex = (page - 1) * pageSize;
          const endIndex = page * pageSize;
          
          // Verificar límites de los índices
          const validStartIndex = Math.max(0, Math.min(startIndex, dbResults.length - 1));
          const validEndIndex = Math.max(0, Math.min(endIndex, dbResults.length));

          // Extraer la información necesaria de la segunda plantilla (base de datos)
          const extractedData = dbResults
            .slice(validStartIndex, validEndIndex)
            .map(({ message, type, idGupshup, publicUrl, createdAt }) => ({
              message,
              type,
              idGupshup,
              publicUrl,
              createdAt,
            }))
           
            const allAppId = externalApiResponse.data.templates.map(
              (template) => template.appId
            );
         
          // Obtener todos los valores de 'status' y 'category' de la API externa
          const allStatusValues = externalApiResponse.data.templates.map(
            (template) => template.status
          );
          const allCategories = externalApiResponse.data.templates.map(
            (template) => template.category
          );

          // Validación: si el tipo es IMAGE, realizar operación específica
          const imageTemplates = extractedData.filter(
            (template) => template.type === "IMAGE"
          );

          if (imageTemplates.length > 0) {
            // Realizar operación específica si hay plantillas de tipo IMAGE
            imageTemplates.forEach((imageTemplate) => {
              // Lógica específica para plantillas de tipo IMAGE
            });
          }

          // Unificar la información de la API externa y la base de datos
          const unifiedData = externalApiResponse.data.templates.map(
            (template, index) => ({
              appId: allAppId[index],
              status: allStatusValues[index],
              category: allCategories[index],
              ...extractedData[index],
            })
          );

          // Filtrar objetos sin la propiedad 'message'
          const filteredData = unifiedData.filter(
            (template) => template.message !== undefined
          );

          console.log("filteredData", filteredData);
          // Puedes enviar la información filtrada y paginada en la respuesta si es necesario
          res.json({
            data: filteredData,
            pagination: {
              page,
              pageSize,
              totalPages: Math.ceil(dbResults.length / pageSize),
            },
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


export const updateTemplate = async (req, res) => {
  try {
    
  } catch (error) {
    
  }
}