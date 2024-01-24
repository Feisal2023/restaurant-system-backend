import nodemailer from "nodemailer";
import { emailHOST, emailPASS, emailUSER } from "../config/config.js";
const sendForgotEmail = async (
  subject,
  message,
  send_to,
  sent_from,
  reply_to
) => {
  // create email transporter
  const transporter = nodemailer.createTransport({
    host: emailHOST,
    port: 587,
    auth: {
      user: emailUSER,
      pass: emailPASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // Options for sending email
  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };

  // send email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

export default sendForgotEmail;
