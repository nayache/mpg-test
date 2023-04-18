import express from 'express';
import * as dotenv from "dotenv";
import 'reflect-metadata';
import leagueRoutes from './src/routes/league';
import teamRoutes from './src/routes/team';
import Container from 'typedi';
import { DataAccessLayer } from './src/database/dataAccess';
import { errorHandler } from './src/middlewares/errorHandler';
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './docs/swagger.json';
import { notFound } from './src/middlewares/notfound';
require("express-async-errors");

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function connectDatabase() {
    console.log('Waiting etablishing connection to database..');
    await sleep(5000);
    try {
        const auth: string = Buffer.from(`${process.env.CB_USERNAME}:${process.env.CB_PASSWORD}`).toString('base64');
        const response = await axios.get(`http://couchbase:8091/pools/default/buckets/${process.env.CB_BUCKET_NAME}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
        });
        if (response.status !== 200) {
            await connectDatabase();
        }
    } catch(err) {
        await connectDatabase();
    }
}

async function main() {
    
    dotenv.config();
    const app = express();
    
    await connectDatabase();
    await Container.get(DataAccessLayer).init();
    
    app.listen(3042, () => console.info("Server run on port 3042"));
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use(express.json());
    
    app.use("/leagues", leagueRoutes);
    app.use("/teams", teamRoutes);
    app.use(notFound);
    
    app.use(errorHandler);
}

main();