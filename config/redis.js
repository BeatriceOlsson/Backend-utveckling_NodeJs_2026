import { connect } from "mongoose";
import { createClient } from "redis";

const client = createClient();

//Startar och kör Redis en gång och skickar error om fel.
client.on('error', (err) =>
console.error('Redis-fel: ', err));

await client.connect();
console.log('Redis connected');

// Ta bort await connect() då fel rullade och kunde inte gå vidare. Kan kolla på längra fram

export default client;