import { connect } from "mongoose";
import { createClient } from "redis";

const client = createClient();

//Startar och kör Redis en gång och skickar error om fel.
client.on('error', (err) =>
console.error('Redis-fel: ', err));

//await client.connect() skappar error om inte länkad till container som kör.
await client.connect();
console.log('Redis connected');

export default client;