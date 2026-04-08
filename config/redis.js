import dotenv from 'dotenv';
import { createClient } from "redis";
dotenv.config();
const client = createClient({
    url: process.env.REDIS_URL
});

//Startar och kör Redis en gång och skickar error om fel.
client.on('error', (err) => {
    console.error('Redis-fel: ', err);
});

//await client.connect() skappar error om inte länkad till container som kör.
await client.connect();
console.log('Redis connected');

export default client;