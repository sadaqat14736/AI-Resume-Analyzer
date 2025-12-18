const mongoose = require("mongoose");
const dotenv = require("dotenv");


dotenv.config();
console.log(process.env.DB);

async function dbCon() {
    try{
        const db = await mongoose
        .connect(`mongodb+srv://sadaqat:${process.env.DB}@cluster0.g3mjkkw.mongodb.net/AI_Resume_And_Job_app`)
        .then(() => console.log("Database connected"))
        .catch((err) =>console.log(`Connection failed  ${err}`));
        mongoose.connection.on("connected", () => console.log("DATABASE SUCCESSFULLY CONNECTED...!"));
        mongoose.connection.on("disconnected", () => console.log("DATABASE CONNECTION TERMINATED...!"));
    }
    catch(err){
        console.log(err, "Here is an error");

    }
}




module.exports = dbCon;    