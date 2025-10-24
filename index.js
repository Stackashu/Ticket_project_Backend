import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/user.js'
import ticketRoutes from './routes/ticket.js'
dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()
app.use(cors());
app.use(express.json());


app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/tickets",ticketRoutes)

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("MongoDb connected");
    app.listen(PORT,()=>{
        console.log(`Server running at port http://localhost:${PORT}`)
    })
}).catch((err)=>console.error(`MongoDb err ${err}`))
