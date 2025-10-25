import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import sendMail from "../../utils/mailer.js";
import analyzeTicket from "../../utils/AiAgent.js";
import ticket from "../../models/ticket.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-creaetd", retries: 2 },
  { event: "ticket/created" },

  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      //fetch ticket from db
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketFound = await Ticket.findById(ticketId);

        if (!ticketFound) {
          throw new NonRetriableError("Ticket not found.");
        }
        return ticketFound;
      });
      //here updating the ticket status
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, {
          status: "TODO",
        });
      });

      //   here getting the response from ai about the ticket
      const aiResponse = await analyzeTicket(ticket);

      // for fetching skills needed for the ticket or problem
      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfullNotes: aiResponse.helpfullNotes,
            status: "IN_PROGESS",
            realatedSkills: aiResponse.realatedSkills,
          });
          skills = aiResponse.realatedSkills;
        }
        return skills;
      });
      //    here assigning the ticket to user if not available assigned to admin
      const moderator = await step.run("assign-moderator", async () => {
        const user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        return user;
      });
      //   here sending the email to the user
      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.emial,
            "Ticket Assigned",
            `A new Ticket is assigned to you ${finalTicket.title} .`
          );
        }
      });

      return { success: true };
    } catch (error) {
      console.log("Error running the steps" + error.message);
      return { success: false };
    }
  }
);
