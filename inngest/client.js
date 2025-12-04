import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ticketing-system",
  eventKey: process.env.INNGEST_EVENT_API_KEY,      // EVENTS SEND karne ke liye
  signingKey: process.env.INNGEST_SIGNING_KEY || 'dev', // INNGEST → backend workflow ke liye
});
