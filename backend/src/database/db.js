import mongoose from "mongoose"
import DB_NAME from "../constants.js"

const connectDB = async(req, res) => {
    try {
        const databaseInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Database connected: hostName: ${databaseInstance.connection.host} || port: ${databaseInstance.connection.port} || db_name: ${databaseInstance.connection.name}!`)
        // console.log(databaseInstance.connection)
        return  databaseInstance;
    } catch (error) {
        throw error
    }
}

export default connectDB