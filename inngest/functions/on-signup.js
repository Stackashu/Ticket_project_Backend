import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import User from "../../models/user.js";
import sendMail from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" }, //event on which it will get trigger
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      // here below code will first check in database
      const user = await step.run("get-user-email", async () => {
        //step.run to run a check something or to run a piece of code before triggering something
        const userPresent = await User.findOne({ email });
        if (!userPresent) {
          throw new NonRetriableError("User no longer exists in our database."); // if nonretraiblErro occurs then it will don't move forwar and retires
        }
        return userPresent;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the app`;
        const message = `hi,
        \n\n
        Thanks for signing up. We're glad to have you onboard!`;

        await sendMail(user.email, subject, message);
      });

      return {success:true}
    } catch (error) {
        console.error("Error running step",error.message)
        return {success:false}
    }
  }
);
