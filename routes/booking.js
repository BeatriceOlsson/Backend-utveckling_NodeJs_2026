import express from 'express';
import Booking from '../models/booking.models.js';
import Room from '../models/room.models.js';
import { verifyJWTToken } from '../middleware/jwt.middleware.js';
import client from '../config/redis.js';

const router = express.Router();

//Hämmtar bookningar, användare kan se alla och användare kan bara se sin egna
router.get('/', verifyJWTToken, async (req, res) => {
    const chacheKey = req.user.role === 'admin' ? 'bookings:admin' : `bookings:user:${req.user.id}`;

    try {//.populate används för att hämta data från de länkande dokumenet

        const chachedData = await client.get(chacheKey);
        if (chachedData) {
            return res.json(JSON.parse(chachedData));
        }

        let bookings;
        if (req.user.role === 'admin') {
            bookings = await Booking.find().populate('roomId').populate('userId', 'userName');
        } else {
            bookings = await Booking.find({ userId: req.user.id }).populate('roomId');
        }

        await client.setEx(chacheKey, 60, JSON.stringify(bookings));

        return res.status(200).json(bookings)
        
    } catch (err) {
        console.error('Fel vid hämtning av booking: ', err);
        return res.status(500).json({ message: err.message });
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
        
        await client.del(`bookings:user:${req.user.id}`);
        await client.del('bookings:admin');

        const io = req.app.get('io');
        io.emit('bookingCreated', {
          sucses: true,
          message: savedBooking  
        })
        
        return res.status(201).json(savedBooking);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

//Uppdatera booking,användare kan uppdatera sin bokning admin kan uppdatera alla.
router.put('/:id', verifyJWTToken, async (req, res) => {
    try {
        const { roomId, startTime, endTime } = req.body;
        const bookingToChange = await Booking.findById(req.params.id);
        
        //kollar att det fins en bokning och data som behövs.
        if (!bookingToChange) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!roomId || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }

        //kontrolerar överlapning av bokningar mot alla rumets bokningar mot datan i db.
        const overlapBookning = await Booking.findOne({
            roomId: roomId,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            //$ne = Not Equal kollar inte på ens egna bokning vid kontrol.
            _id: { $ne: req.params.id }
        })

        if (overlapBookning) {
            return res.status(400).json({ message: 'Booking overlaps with existing booking' });
        }

        //tillåter ägare och admin att uppdatera bokning annars stoppas.
        if (req.user.role !== 'admin' && bookingToChange.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        // allt ok – uppdatera och returnera den nya versionen uttan att uppdatera anväraren och rummet.
        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            { roomId, startTime, endTime },
            { new: true }
        ).populate('roomId').populate('userId', 'userName');

        await client.del(`bookings:user:${req.user.id}`);
        await client.del('bookings:admin');

        const io = req.app.get('io');
        io.emit('bookingUpdated', {
            sucses: true, 
            message: updated
        })

        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', verifyJWTToken, async (req, res) => {
    try {
        const bookingToDelete = await Booking.findById(req.params.id);

        //Kollar mycket av samma som PUT men raderar om alt är ok.
        if (!bookingToDelete) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.role !== 'admin' && bookingToDelete.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this booking' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        
        await client.del(`bookings:user:${req.user.id}`);
        await client.del('bookings:admin');

        const io = req.app.get('io');
        io.emit('bookingDeleted', {
            sucses: true,
            message: 'Bokningen har raderats'
        })

        return res.status(200).json({ message: 'Booking deleted successfully' });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;