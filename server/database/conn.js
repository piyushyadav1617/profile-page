import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const ATLAS_URI = process.env.ATLAS_URI;
async function connect() {


    mongoose.set('strictQuery', true)

    const db = await mongoose.connect(ATLAS_URI);

    console.log("Database Connected")
    return db;
}

export default connect;