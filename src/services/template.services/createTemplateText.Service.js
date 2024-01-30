import axios from "axios";
import Channel from "../../models/channel.model.js";

export const postTemplateText = async (req, res) => {
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

    if (apiResponse.data.status !== "success") {
      // Agregar esta lógica para manejar el error específico
      if (
        apiResponse.data.status === "error" &&
        apiResponse.data.message.includes("Template Already exists")
      ) {
        return res.status(400).json({
          success: false,
          message: "Template Already exists - ya existe",
        });
      }

      return res.status(500).json({
        success: false,
        message: apiResponse.data.message,
      });
    }

    const firstApiTemplateId = apiResponse.data.template.id;
    const contentFromReqBody = apiResponse.data.template.data;

    const { title } = req.body.campaignTemplate.variables;
    const { idGupshup } = req.body.campaignTemplate.variables;
    const token = req.body.campaignTemplate.token;

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
        },
      }
    );
    if (secondApiResponse.status === 200) {
      return { message: "plantilla creada con exito", status: 200 };
    } else {
      return { message: "error al crear la plantilla", status: 500 };
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

    return { message: "Error al procesar la solicitud", status: 500 };
  }
};
