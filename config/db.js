import mongoose from 'mongoose';

async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Ansluten till MongoDB');
    }catch(error) {
        console.error('Fel vid anslutning till MongoDB:', error);
    }

    //logar om det är problem med anslutningen efter att den har etablerats
    mongoose.connection.on('error', err => {
        console.error('MongoDB-anslutningsfel:', err);
    })
}
    

export default connectToMongoDB;