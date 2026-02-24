import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
//Salt antal runder som hämtas från .env filen och används i bcrypt.hash() metoden för att hash:a lösenordet innan det sparas i databasen.
const saltNumber = parseInt(process.env.SALT_ROUNDS)|| 10; 

const usersSchema = new mongoose.Schema({
    userName: {type: String, unique:true, required: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["user", "admin"], default: "user"}
})

//Pre-save hook som körs innan en användare sparas i databasen. Denna hook hash:ar lösenordet med bcrypt innan det sparas, vilket ökar säkerheten genom att inte lagra lösenord i klartext.
//Hänvisa till 'save' när användare skappas eller uppdateras. pre säger att köra först innan spara.
usersSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, saltNumber);
        return next();
    }catch (error) {
        return next(error);
    }
})

const User = mongoose.model('User', usersSchema);

export default User;