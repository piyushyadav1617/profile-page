import mongoose from "mongoose";
// import ENV from '../config.js'

async function connect() {
    const uri = "mongodb://127.0.0.1:27017"; // Replace "your-mongodb-uri" with your actual MongoDB connection URI

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Database Connected");
    } catch (error) {
        console.error("Database Connection Error:", error);
    }
}

export default connect;
