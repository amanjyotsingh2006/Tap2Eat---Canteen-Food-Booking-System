import "dotenv/config"
import { connectDB } from "./config/db.js"
import app from "./app.js"

const PORT = process.env.PORT

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server listening at ${PORT}`)
        })
    } catch (error) {
        console.log("Error in starting server")
    }
}
startServer();