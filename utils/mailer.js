import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: "ashu12141214@gmail.com",
            pass:"qhtz dixv gcnr pims"
        }
    });

    const info = await transporter.sendMail({
        from : " StackAshu",
        to,
        subject,
        text
    })

    console.log("Message sent ",info.messageId);
    return info;
  } catch (error) {
    console.error("Mail error :",error.message);
    throw error
  }
};
