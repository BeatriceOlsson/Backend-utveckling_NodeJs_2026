import express from 'express';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import requestLogger from './middleware/requestLogger.js';
import connectToMongoDB from './config/db.js';
import roomsRouter from './routes/rooms.js';
import bookingsRouter from './routes/booking.js';

//läser in .env-filen och gör variablerna tillgängliga i process.env
dotenv.config();

//Ansluter till MongoDB med hjälp av funktionen connectToMongoDB som importeras från db.js. Detta gör att applikationen kan kommunicera med databasen för att lagra och hämta data.
connectToMongoDB();

const app = express();

//tar emot JSON-data i request body och gör den tillgänglig i req.body
app.use(express.json());
app.use(requestLogger);

app.use('/rooms', roomsRouter);
app.use('/bookings', bookingsRouter);//skappa router
//app.use('/admin', adminRouter);//skappa router

//Felhantering - fångar alla fel som uppstår i applikationen och skickar en generisk felmeddelande till klienten, samtidigt som det loggar det faktiska felet i serverns konsol. Detta hjälper till att hålla klienten informerad om att något gick fel utan att avslöja känslig information om servern.
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);
    res.status(err.status || 500).json({
        success: false,
        message: 'Fel uppstog på server'
    });
});

app.get('/', (req, res) => {
    res.send('Välkommen till min Express-server!');
});

//startar servern på den port som anges i .env-filen eller på port 3000 om ingen port anges
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servern körs på port ${port}`);
})
