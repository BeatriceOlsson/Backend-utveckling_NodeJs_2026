import express from 'express';
import dotenv from 'dotenv';
import logger from './middleware/logger.js';
import connectToMongoDB from './config/db.js';
import roomsRouter from './routes/rooms.js';
//läser in .env-filen och gör variablerna tillgängliga i process.env
dotenv.config();

//Ansluter till MongoDB med hjälp av funktionen connectToMongoDB som importeras från db.js. Detta gör att applikationen kan kommunicera med databasen för att lagra och hämta data.
connectToMongoDB();

const app = express();

//tar emot JSON-data i request body och gör den tillgänglig i req.body
app.use(express.json());
app.use(logger);

app.use(roomsRouter);

app.get('/', (req, res) => {
    res.send('Välkommen till min Express-server!');
});

//startar servern på den port som anges i .env-filen eller på port 3000 om ingen port anges
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servern körs på port ${port}`);
})

//Felhantering - fångar alla fel som uppstår i applikationen och skickar en generisk felmeddelande till klienten, samtidigt som det loggar det faktiska felet i serverns konsol. Detta hjälper till att hålla klienten informerad om att något gick fel utan att avslöja känslig information om servern.
app.use((err, req, res, next) => {
    console.error(`Ett fel uppstod: ${err.message}`);
    res.status(500).send('Ett fel uppstod på servern');
})