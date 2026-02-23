import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
//verifierar JWT token i request header och lägger till användarinfo i req.user

const secretKey = process.env.JWT_SECRET;

function skappaJWTToken (user) {
    const playload = {
        id: user._id,
        role: user.role
    }
    const token = jwt.sign(playload, secretKey, {expiresIn: '2h'});
    return token;
}

function verifyJWTToken (req, res, next) {
    const tokenHeader = req.header('authorization')?.split(' ')[1];

    //kontrolerar om token finns i headern och om secretKey är definierad. Om någon av dessa saknas, returneras ett felmeddelande med lämplig statuskod.
    if(!tokenHeader) return res.status(401).send('Token saknas');
    if(!secretKey) return res.status(500).send('Serverfel: JWT hemlighet saknas');

    try {
        const adminVerify = jwt.verify(tokenHeader, secretKey);
        req.user = adminVerify;
        next();
    } catch (error) {
        return res.status(403).send('Ogiltig token');
    }
}
 
//kontrolerar rollen på användaren genom att skriva (req.user.role) 
