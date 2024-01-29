import { connectDB } from './src/database.js'
import { PORT } from './src/config.js'
import app from './src/app.js'
import serverless from "serverless-http"
import cors from 'cors'


connectDB();

app.use(cors());

if (process.env.DEVELOPMENT === 'true') {
    app.listen(PORT, () => {
        console.log(`Servidor iniciado en la puerto privada ${PORT}`);
    });
}


export const handler = serverless(app);