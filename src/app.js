import cors from 'cors';
import express from 'express';
import campaignRoutes from './routes/campaign.routes.js';
import bodyParser from 'body-parser'
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended :true}));
app.use('/api', campaignRoutes);

export default app;