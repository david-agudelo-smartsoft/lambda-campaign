import {postTemplateText} from "../services/template.services/createTemplateText.Service.js";
import {image} from "../services/template.services/imageTemplate.Service.js";
import {postTemplateImage} from "../services/template.services/createTemplateImage.Service.js";
import {getTemplate} from "../services/template.services/getTemplate.Service.js";
import {getByUpdateStatus} from "../services/template.services/getByUpdateStatus.Service.js";

export const postTemplateTextGupshup = async (req, res) => {
  try {
    const result = await postTemplateText(req);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const imageGupshup = async (req, res) => {
  try {
    const result = await image(req);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const postTemplateImageGupshup = async (req,res) => {
  try{
    const result = await postTemplateImage(req);
    res.json(result);
  }catch(error){
    return res.status(500).json({ message: error.message });
  }
};

export const getTemplateGupshup = async (req, res) => {
  try {
    const result = await getTemplate(req);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getByUpdateStatusGupshup = async (req, res) => {
 try {
  const result = await getByUpdateStatus(req);
  res.json(result);
 } catch (error) {
  return res.status(500).json({ message: error.message });
 }
};