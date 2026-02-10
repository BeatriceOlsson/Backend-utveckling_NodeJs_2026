const logger = (req, res, next) => {
    console.log(`Metod: ${req.method}, URL: ${req.url}, Tid: ${new Date().toISOString()}`);
    next();
}

export default logger;


/*
hur man hänvisar till logger-middleware i server.js:
aktiverar logger-middleware i server.js genom att importera den och använda den i app.use(). Detta gör att varje inkommande request loggas med metod, URL och tidpunkt, vilket är användbart för att övervaka och felsöka applikationen.
import logger from './middleware/logger.js';
app.use(logger);

send logas automatiskt varje gång en request görs till servern, inklusive metod, URL och tidpunkt. Detta hjälper till att övervaka trafiken och identifiera eventuella problem i applikationen.
app.get('', (req, res) => {
    res.send('Välkommen till min Express-server!');
})
*/