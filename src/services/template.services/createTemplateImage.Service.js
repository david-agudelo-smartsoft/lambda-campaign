import axios from "axios";
import Channel from "../../models/channel.model.js";
import Template from "../../models/template.model.js";

export const postTemplateImage = async (req, res) => {
  try {
    const { project } = req.body.campaignTemplate.project;
    const db = await Channel.find({ project: `${project}`, type: "GUPSHUP" });
    const id = db[0].appIdGushup;
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

      if (apiResponse.data.status !== "success") {
        return { error: "Failed to post template image" };
      }

      if (apiResponse.data.status === "success") {
        const firstApiTemplateId = apiResponse.data.template.id;
        const contentFromReqBody = apiResponse.data.template.data;
        const token = req.body.campaignTemplate.token;
        const { project } = req.body.campaignTemplate.project;
        const { title } = req.body.campaignTemplate.variables;
        const { idGupshup } = req.body.campaignTemplate.variables;
        const url = req.body.campaignTemplate.url;

        const apiImage = await axios.head(`${url}`);
        const filename = apiImage.config.url
        const urlPrefixToRemove = `${process.env.REMPLACE}`;
        const result = filename.replace(urlPrefixToRemove, '');
        const filenameWithoutPrefix = result;

        const secondApiResponse = await axios.post(
          `${process.env.AGENTE_CHAT}`,
          {
            campaignTemplate: {
              channel: "GUPSHUP",
              type: "IMAGE",
              message: ` ${contentFromReqBody}`,
              project: `${project}`,
              mediaInfo: {
                filename: `${filenameWithoutPrefix}`,
                fileSize: `${apiImage.headers["content-length"]}`,
                mimetype: `${apiImage.headers["content-type"]}`,
              },
              externalIntegrationInfo: {
                id: firstApiTemplateId,
                params: ["Pruebas", "pruebas@correo.com"],
              },
              title: `${title}`,
              idGupshup: `${idGupshup}`,
              publicUrl: `${url}`,
              status: "PENDING",
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        if (secondApiResponse.status === 200) {
          return { message: "plantilla creada con exito", status: 200 };
        } else {
          return { message: "error al crear la plantilla", status: 500 };
        }
      }
    }
  } catch (error) {
    console.error(error);

    if (
      error.response &&
      error.response.data.message ===
        "Template Already exists with same namespace and elementName and languageCode"
    ) {
      return { message: "el template ya existe", status: 415 };
    }

    if (
      error.response &&
      error.response.data.message === "Invalid element name provided"
    ) {
      return { message: "el nombre no es valido", status: 415 };
    }
    if (
      error.response &&
      error.response.data.message === "Cannot Process Request Now"
    )
      return { message: "La imagen no es valida", status: 500 };
  }
  return { message: "intenta nuevamente" };
};
