import app from "./app.js"
import "dotenv/config"
import connectDB from "./database/db.js"

//niche hum db call karenge aur server start karenge

connectDB()
.then((databaseInstance) => {
    console.log("Database Connection Successfull !!")
    app.on("error", () => {
        console.log("database stopped unexpectedly !")
    })
    app.listen(process.env.PORT, () => {
        console.log(`server is deployed at ${process.env.PORT} captain !!`)
    })
})