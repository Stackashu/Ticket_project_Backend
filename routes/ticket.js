import express from "express";
import { authenticate } from "../middleware/authorization.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticket.js";
const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket); //for fetching the single ticket info
router.post("/", authenticate, createTicket);
export default router;
