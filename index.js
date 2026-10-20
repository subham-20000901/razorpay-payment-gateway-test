import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/database.js";
import paymentRouter from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/payments",paymentRouter)

const startServer = async () =>{
try {
    await connectDB();
    app.listen(PORT,() =>{
        console.log(`Server Started At PORT:${PORT}`)
    })
} catch (error) {
   console.log(error.message) 
}
}

startServer();