import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-creation.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/tickets", ticketRoutes);

// for the inngest function to run those automation 
app.use("/api/inngest", serve({
    client: inngest, 
    functions: [onUserSignup, onTicketCreated]
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDb connected");
    app.listen(PORT, () => {
      console.log(`Server running at port http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error(`MongoDb err ${err}`));
