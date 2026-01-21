import mongoose from "mongoose";

const connectDB=async ()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGOURI,{
            dbName:"AuthSystem",
        })

        console.log(`mongodb connected successfully :${conn.connection.host}`)
    } catch (error) {
        console.log("mongodb connection failed");
        console.error(error.message);
        process.exit(1)
    }
}

export default connectDB;