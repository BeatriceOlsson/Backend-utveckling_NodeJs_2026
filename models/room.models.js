import mongoose from 'mongoose';

const roomsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    capacity: {type: Number, required: true, min: 1},
    type: {type: String, required: true, enum: ['workspace', 'conference']}
})

const Room = mongoose.model('Room', roomsSchema);

export default Room;