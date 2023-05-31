import mongoose from "mongoose";



// import ENV from '../config.js'

async function connect() {

    const getUri = mongod.getUri();
    mongoose.set('strictQuery', true)

    const db = await mongoose.connect('mongodb://127.0.0.1:27017/myapp');

    console.log("Database Connected")
    return db;
}

export default connect;