import express from 'express';
import rooms from '../data/rooms.js';
const router = express.Router();

//Hämtar alla rum
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Skappar ett nytt rum
router.post('/rooms', async (req, res) => {
    const room = new Room({
        name: req.body.name,
        capacity: req.body.capacity,
        type: req.body.type
    });

    try {
        const newRoom = await room.save();
    }

    rooms.push(newRoom);
    res.status(201).json(newRoom);
    
})

//Uppdaterar ett rum
router.put('/rooms/:id', (req, res) => {
    const roomID = rooms.find( r => r.id === parseInt(req.params.id));
    if (!roomID) return res.status(404).send('Rummet hittades inte.');

    roomID.name = req.body.name;
    roomID.capacity = req.body.capacity;
    roomID.type = req.body.type;

    res.send(roomID);
});

//Tar bort ett rum
router.delete('/rooms/:id', (req, res) => {
    const roomID = rooms.find( r => r.id === parseInt(req.params.id));

    if (roomID === -1) return res.status(404).send('Rummet hittades inte.');

    const deletedRoom = rooms.splice(roomID, 1);
    res.json(deletedRoom[0]);
})

export default router;