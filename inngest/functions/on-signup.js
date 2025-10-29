import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import User from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" }, //event name  on which it will get trigger
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      // console.log("emial at user pipeline 1:", email);
      // here below code will first check in database
      const user = await step.run("get-user-email", async () => { //sub-task of the pipeline with name get-user-emial
        //step.run to run a check something or to run a piece of code before triggering something
        const userPresent = await User.findOne({ email });

        if (!userPresent) {
          throw new NonRetriableError("User no longer exists in our database."); // if nonretraiblErro occurs then it will don't move forward and retires
        }

        return userPresent;
      });

      // console.log("user is ", user);

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the App`;
        const message = `Hello ${user.email},

Welcome to HireDevs!

Thank you for signing up. We are excited to have you as part of our community.
If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
The Team`;

        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("Error running step", error.message);
      return { success: false };
    }
  }
);
