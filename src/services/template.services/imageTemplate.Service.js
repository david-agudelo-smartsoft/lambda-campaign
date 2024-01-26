import axios from "axios";
import Channel from "../../models/channel.model.js";
import { Blob } from "buffer";
import { S3Uploader } from "../s3.service.js";

export const image = async (req, res) => {
    const project = req.body;
    const body = project.jsonBody;
    const db = await Channel.find({ project: `${body}`, type: "GUPSHUP" });
    const appname = db[0].appname;
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
    const s3Response = await s3Uploader.uploadFile(file,appname);
    return { mediaId: response.data.mediaId, urlAWS: s3Response.Location };
}