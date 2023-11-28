import { connectDB } from './src/database.js'
import { PORT } from './src/config.js'
import app from './src/app.js'
import serverless from "serverless-http"

connectDB();

if (process.env.DEVELOPMENT === 'true') {
    app.listen(PORT, () => {
        console.log(`Servidor iniciado en la puerto privada ${PORT}`);
    });
}


export const handler = serverless(app);