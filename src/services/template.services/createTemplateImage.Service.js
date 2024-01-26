import axios from "axios";
import Channel from "../../models/channel.model.js";
import Template from "../../models/template.model.js";

export const postTemplateImage = async (req, res) => {
  try {
    const { project } = req.body.campaignTemplate.project;
    const db = await Channel.find({ project: `${project}`, type: "GUPSHUP" });
    const id = db[0].appIdGushup;
    console.log(id);

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

      console.log(apiResponse.data.template.status);

      if (apiResponse.data.status !== "success") {
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
              externalIntegrationInfo: {
                id: firstApiTemplateId,
                params: ["Pruebas", "pruebas@correo.com"],
              },
              mediaInfo:{},
              title: `${title}`,
              idGupshup: `${idGupshup}`,
              publicUrl: `${url}`,
              status: `PENDING`,
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
