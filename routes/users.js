import express from 'express';
import User from '../models/users.models.js';
import { skappaJWTToken } from '../middleware/jwt.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/register', async (req, res) => {
    
    if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
}
    try {
        //tar ut värden från body och kollar att de har ett värde
        const {userName, password, role, adminKey} = req.body;
        //säkerhets kontrol för att säkra att endast admin kan skappa en admin användare med admin nykel.
        let userRole = 'user';
        if (role === 'admin') {
            if (adminKey === process.env.ADMIN_KEY) {
                userRole = 'admin';
            } else {
                return res.status(403).json({ message: 'Invalid admin key' });
            }
        }

        if (!userName ||!password) {
            return res.status(400).json({ message: 'Name and password are required' });
        }
        //kollar längd på namn och lösenord
        if (userName.length <= 6 || password.length <= 6) {
            return res.status(400).json({ message: 'Name and password must be at least 6 characters long' });
        }
        //kollar om användare med samma namn redan fins
        const existingUser = await User.findOne({ userName });
        
        if ( existingUser ) {
            return res.status(400).json({ message: 'User already exists' });
        }
        //Skappar och sparar användare i db
        const newUser = new User({ 
            userName,
            password, 
            role: userRole 
        });

        await newUser.save();
        console.log('User saved');
        return res.status(201).json({ message: 'User created successfully' });
    
    }catch (err) {
        console.error(err); 
        return res.status(500).json({ error: err.message });
    }
})

router.post('/login', async (req, res) => {
    try {
        const {userName, password} = req.body;

        if (!userName || !password) {
            return res.status(400).json({ message: 'Name and password are required' });
        }

        const user = await User.findOne({ userName });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const passwordMatch = await user.comparePassword(password);

        if (!passwordMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = skappaJWTToken(user);

        const io = req.app.get('io');
        io.emit('userLogin', {
            sucsess: true,
            message: 'Användare har logat in'
        });
        
        return res.status(200).json({ token });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

export default router;