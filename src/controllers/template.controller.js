import axios from "axios";
import qs from "querystring";

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
        vertical
      } = req.body.campaignTemplate;
      console.log(req.body.campaignTemplate);
  
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
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTI0NjZiNzkzOGEyZDAwMTM4NjQzM2EiLCJuYW1lIjp7ImZpcnN0TmFtZSI6ImFkbWluIiwibGFzdE5hbWUiOiIyIn0sInJvbGUiOiJBRE1JTiIsImNvbXBhbnkiOiI2MGFkNzAxNjU3YjRmZTAwMTNkNGQ2ZTkiLCJsYXN0TG9naW4iOiIyMDIzLTEyLTA1VDE2OjM3OjU3Ljc1NFoiLCJmaXJzdExvZ2luIjpmYWxzZSwiaWF0IjoxNzAxNzk0Mjc3LCJleHAiOjE3MDE4ODA2Nzd9.RX6ThUpvmjrci19ao7HYFYcL8LvhAe0MEzJwfCF4JpI",
              // Otras cabeceras necesarias para la segunda API
            },
          }
        );
      } else {
       console.log("La primera API respondió con un error:", apiResponse.data.error)
      }
    } catch (error) {
     
      
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
      } = req.body;
      console.log(req.body);
  
      const requestData = {
        languageCode,
        content,
        category,
        templateType,
        elementName,
        exampleHeader,
        example,
        vertical,
      };
  
      const requestBody = qs.stringify(requestData);
  
      const apiResponse = await axios.post(
        "https://api.gupshup.io/wa/app/e16ef554-0930-4b6e-88bd-6e948ce5f78a/template",
        requestBody,
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
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTI0NjZiNzkzOGEyZDAwMTM4NjQzM2EiLCJuYW1lIjp7ImZpcnN0TmFtZSI6ImFkbWluIiwibGFzdE5hbWUiOiIyIn0sInJvbGUiOiJBRE1JTiIsImNvbXBhbnkiOiI2MGFkNzAxNjU3YjRmZTAwMTNkNGQ2ZTkiLCJsYXN0TG9naW4iOiIyMDIzLTEyLTA1VDE2OjM3OjU3Ljc1NFoiLCJmaXJzdExvZ2luIjpmYWxzZSwiaWF0IjoxNzAxNzk0Mjc3LCJleHAiOjE3MDE4ODA2Nzd9.RX6ThUpvmjrci19ao7HYFYcL8LvhAe0MEzJwfCF4JpI",
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
