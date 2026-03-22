import express from 'express';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import requestLogger from './middleware/requestLogger.js';
import connectToMongoDB from './config/db.js';
import roomsRouter from './routes/rooms.js';
import bookingsRouter from './routes/booking.js';
import usersRouter from './routes/users.js'
import { Server } from 'socket.io';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

//läser in .env-filen och gör variablerna tillgängliga i process.env
dotenv.config();

//Ansluter till MongoDB med hjälp av funktionen connectToMongoDB som importeras från db.js. Detta gör att applikationen kan kommunicera med databasen för att lagra och hämta data.
connectToMongoDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set('io', io);

//tar emot JSON-data i request body och gör den tillgänglig i req.body
app.use(express.json());
app.use(requestLogger);

const __filname = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filname);

app.use(express.static('public'));

app.use('/rooms', roomsRouter);
app.use('/bookings', bookingsRouter);//skappa router
app.use('/users', usersRouter);//skappa router

//Felhantering - fångar alla fel som uppstår i applikationen och skickar en generisk felmeddelande till klienten, samtidigt som det loggar det faktiska felet i serverns konsol. Detta hjälper till att hålla klienten informerad om att något gick fel utan att avslöja känslig information om servern.
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);
    res.status(err.status || 500).json({
        success: false,
        message: 'Fel uppstog på server'
    });
});

console.log('Testar router-import:', typeof usersRouter); 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
    //res.send('Välkommen till min Express-server!');
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'))
    //res.send('Välkommen till min Express-server!');
});

app.post('/test', (req, res) => {
    console.log("Test-anrop mottaget!");
    res.json({ ok: true });
});

io.on('connection', (socket) => {
    console.log('Användare anslöt sig; ', socket.id);
    
    socket.on('message', (msg) => {
        console.log('Medelande från användare: ', msg);
        socket.emit('serverMesage: ', `Server säger: ${msg}`);
    });
    socket.on('disconnect', () => {
        console.log('Användare kopplade ifrån: ', socket.id)
    });
});

//startar servern på den port som anges i .env-filen eller på port 3000 om ingen port anges
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servern körs på port ${port}`);
})
