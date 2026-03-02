import express from 'express';
import Room from '../models/room.models.js';
import { verifyJWTToken, verifyAdminRole } from '../middleware/jwt.middleware.js';

const router = express.Router();

//Hämtar alla rum
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Skappar ett nytt rum
router.post('/', verifyJWTToken, verifyAdminRole, async (req, res) => {
    if (!req.body.name || !req.body.capacity || !req.body.type) {
        return res.status(400).json({ message: 'Alla fält måste fyllas i.' });
    }

    const room = new Room({
        name: req.body.name,
        capacity: req.body.capacity,
        type: req.body.type
    });

    try {
        const newRoom = await room.save();
        return res.status(201).json(newRoom);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

//Uppdaterar ett rum
router.put('/:id', verifyJWTToken, verifyAdminRole, async (req, res) => {
    try {
        const roomID = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!roomID) return res.status(404).send('Rummet hittades inte.');

        return res.json(roomID);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

//Tar bort ett rum
router.delete('/:id', verifyJWTToken, verifyAdminRole, async (req, res) => {
    try {
        const roomID = await Room.findByIdAndDelete(req.params.id);
        if (!roomID) return res.status(404).send('Rummet hittades inte.');

        return res.json(roomID);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
})

export default router;