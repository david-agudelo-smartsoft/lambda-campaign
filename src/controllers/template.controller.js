import axios from "axios";
import qs from "querystring";
import fs from "fs";

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
    const appname = "RayoColMexApp"; // Hardcoded appname as per your request
    const apikey = "bbcms7lbqmxe70qy89kj1jxcfmnjfaze"; // Hardcoded apikey as per your request

    const headers = {
      apikey: apikey,
    };

    const data = await axios.get(
      `https://api.gupshup.io/sm/api/v1/template/list/${appname}`,
      { headers }
    );

    console.log(data.data);

    if (data.data.status === "success") {
      const jsonData = data.data;

      if (jsonData.status === "success") {
        const listTemplates = await axios.post(
          "https://agentechatdevmgt.smartsoft.com.co:3000/campaign-templates", 
          [],
          {
            headers: {
       
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTI0NjZiNzkzOGEyZDAwMTM4NjQzM2EiLCJuYW1lIjp7ImZpcnN0TmFtZSI6ImFkbWluIiwibGFzdE5hbWUiOiIyIn0sInJvbGUiOiJBRE1JTiIsImNvbXBhbnkiOiI2MGFkNzAxNjU3YjRmZTAwMTNkNGQ2ZTkiLCJsYXN0TG9naW4iOiIyMDIzLTEyLTE4VDIyOjA4OjMxLjU2MloiLCJmaXJzdExvZ2luIjpmYWxzZSwiaWF0IjoxNzAyOTM3MzExLCJleHAiOjE3MDMwMjM3MTF9.6a5ruBldDYUfHOf21d9y-Juj9daWie5VsDQyH27wbQc", // Agrega el token si es necesario
            }
          }
        );
        console.log(listTemplates.data);

        const templateIdOK = listTemplates.data.filter((template) => template.id === idGupshupTemplate);

        if (templateIdOK.length === 1) {
          res.json(templateIdOK[0]); // Assuming you want to send the template as a response
          return;
        }
      }
    }
    res.json(data.data); // Assuming you want to send the data as a response
  } catch (error) {
    console.error("Error al realizar la solicitud a la API externa:", error);
    throw new Error("Error interno del servidor: " + error.message);
  }
};
