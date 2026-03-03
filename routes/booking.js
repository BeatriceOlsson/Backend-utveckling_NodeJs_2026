import express from 'express';
import Booking from '../models/booking.models.js';
import Room from '../models/room.models.js';
import { verifyJWTToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

//Hämmtar bookningar, användare kan se alla och användare kan bara se sin egna
router.get('/', verifyJWTToken, async (req, res) => {
    if (req.user.role === 'admin') {
        try {//.populate används för att hämta data från de länkande dokumenet
            const bookings = await Booking.find().populate('roomId').populate('userId', 'userName');
            return res.status(200).json(bookings);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    } else {
        try {
            const booking = await Booking.find({ userId: req.user.id }).populate('roomId');
            return res.status(200).json(booking);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
});

//Skappa en booking och sparar den i databasen tillsamans med kontroller
router.post('/', verifyJWTToken, async (req, res) => {
    try {
        const {roomId, startTime, endTime} = req.body;
        //kollar att al nödvändiga fält finns i request body
        if (!roomId || !req.user.id || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(400).json({ message: 'Rum existerar inte' });
        }

        //kollar att startTime är innan endTime
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }
        //kollar att det inte finns en booking som överlappar med den nya bookingen
        const overlapingBooking = await Booking.findOne({
            roomId: roomId,
            //Les Then= $lt, Greater Then= $gt istället för startTime < endTime
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        })

        if (overlapingBooking) {
            return res.status(400).json({ message: 'Booking overlaps with existing booking' });
        }

        //Om alla kontroller är godkända, skapa en ny booking
        const booking = new Booking({
            roomId: roomId,
            userId: req.user.id,
            startTime: startTime,
            endTime: endTime
        });

        //Spara bookingen i databasen
        await booking.save();
        const savedBooking = await Booking.findById(booking._id).populate('roomId').populate('userId', 'userName');
        return res.status(201).json(savedBooking);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;