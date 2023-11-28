import { config } from "dotenv";
config();


export const MONGODB_URI = process.env.MONGODB_URI;

// export const IP = process.env.IP || "0.0.0.0";

export const PORT = process.env.PORT || 4000;