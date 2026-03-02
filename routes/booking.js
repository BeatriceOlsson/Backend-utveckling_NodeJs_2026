import express from 'express';
import Booking from '../models/booking.js';
import { verifyJWTToken, verifyAdminRole } from '../middleware/auth.js';

const router = express.Router();

//Hämmtar bookningar, användare kan se alla och användare kan bara se sin egna
router.get('/', verifyJWTToken, async (req, res) => {
    if (req.user.role === 'admin') {
        try {//.populate används för att hämta data från de länkande dokumenet
            const bookings = await Booking.find().populate('roomId', 'userId');
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
        //kollar att al nödvändiga fält finns i request body
        if (!req.body.roomId || !req.user.id || !req.body.startTime || !req.body.endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const room = await Room.findById(req.body.roomId);
        if (!room) {
            return res.status(400).json({ message: 'Rum existerar inte' });
        }

        //kollar att startTime är innan endTime
        if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }
        //kollar att det inte finns en booking som överlappar med den nya bookingen
        const overlapingBooking = await Booking.findOne({
            roomId: req.body.roomId,
            //Les Then= $lt, Greater Then= $gt istället för startTime < endTime
            startTime: { $lt: req.body.endTime },
            endTime: { $gt: req.body.startTime }
        })

        if (overlapingBooking) {
            return res.status(400).json({ message: 'Booking overlaps with existing booking' });
        }

        //Om alla kontroller är godkända, skapa en ny booking
        const booking = new Booking({
            roomId: req.body.roomId,
            userId: req.user.id,
            startTime: req.body.startTime,
            endTime: req.body.endTime
        });

        //Spara bookingen i databasen
        const saveBooking = (await booking.save()).populate('roomId');
        return res.status(201).json(saveBooking);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});