import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
//verifierar JWT token i request header och lägger till användarinfo i req.user

const secretKey = process.env.JWT_SECRET;

//Skappar JWT token med användarens id och roll vid inloggning.
function skappaJWTToken(user) {
    const payload = {
        id: user._id,
        role: user.role
    }
    const token = jwt.sign(payload, secretKey, { expiresIn: '5h' });
    return token;
}

//Verifierar JWT nykel och används vid inloggning vid skydade förfrågningar
function verifyJWTToken(req, res, next) {
    const tokenHeader = req.header('authorization')?.split(' ')[1];

    //kontrolerar om token finns i headern och om secretKey är definierad. Om någon av dessa saknas, returneras ett felmeddelande med lämplig statuskod.
    if (!tokenHeader) return res.status(401).json({ message: 'Token saknas' });
    if (!secretKey) return res.status(500).json({ message: 'Serverfel: JWT hemlighet saknas' });

    try {
        const userVerify = jwt.verify(tokenHeader, secretKey);
        req.user = userVerify;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Ogiltig token' });
    }
}

//Kontrolerar rollen på användaren vid förfrågan.
//.json är mer lämpligt för API:er eftersom det är lättare att hantera och analysera i klientapplikationer, medan .send kan användas för att skicka enklare textmeddelanden eller HTML-svar.
function verifyAdminRole(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Endast administratörer har tillgång till denna resurs' });
    }
    next();
}

export { skappaJWTToken, verifyJWTToken, verifyAdminRole };