import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user?._id.toString(),
    });
    
     //here the pipline will start in background
     inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user?._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created and processing started.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    console.log("user is ", user);
    let tickets = [];

    if (user.role === "admin") {
      // Admin: fetch all tickets
      tickets = await Ticket.find()
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      // Non-admin: fetch only user's tickets
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    // console.log("tickets are", tickets);
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getTicketDetail = async (req, res) => {
  try {
    const user = req.user;
    console.log("user", user);
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error in fetching ticket", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
