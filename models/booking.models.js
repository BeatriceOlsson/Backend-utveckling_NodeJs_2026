import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    roomId: {type: mongoose.Schema.Types.ObjectId, ref:'Rooms', required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'Users', required: true},
    startTime: {type: Date, required: true},
    endTime: {type: Date, required: true},
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;