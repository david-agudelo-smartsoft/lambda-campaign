import cors from 'cors';
import express from 'express';
import campaignRoutes from './routes/campaign.routes.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', campaignRoutes);

export default app;