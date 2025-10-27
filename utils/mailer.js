import nodemailer from "nodemailer";

export  const  sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: process.env.GOOGLE_GMAIL,
            pass: process.env.GOOGLE_PASS
        }
    });

    const info = await transporter.sendMail({
        from : process.env.GOOGLE_GMAIL,
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
