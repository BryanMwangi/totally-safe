import { Resend } from "resend";
import dotenv from "dotenv";
import ejs from "ejs";
import fs from "fs";
import { logger } from "../Logs/logs.js";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const verifyTemplate = `${process.env.ROOT_PATH}Emails/Templates/email.ejs`;
const emailTemplate = `${process.env.ROOT_PATH}Emails/Templates/email.html`;

const populateEmail = (template, firstName, link, city, country, time) => {
  const templateContent = fs.readFileSync(template, "utf-8");
  const compiledTemplate = ejs.compile(templateContent);
  const html = compiledTemplate({ firstName, link, city, country, time });
  return html;
};

const testEmail = async (email, firstName, verificationLink) => {
  const { data, error } = await resend.emails.send({
    // from: "Kenyans <noreply@helpkenyans.xyz>",
    to: email,
    subject: "Call to action",
    html: populateEmail(verifyTemplate, firstName, verificationLink),
  });
  if (error) {
    console.log(error);
    return { error: error };
  } else {
    console.log(data);
    return { data: data };
  }
};

const sendMassEmail = async (emails) => {
  const { data, error } = await resend.emails.send({
    from: "Kenyans <noreply@helpkenyans.xyz>",
    to: emails,
    subject: "Call to action",
    html: fs.readFileSync(emailTemplate, "utf-8"),
  });
  if (error) {
    console.log(error);
    logger.error(`Error sending email to ${emails}: ${error}`);
    return { error: error };
  } else {
    logger.info(`Email sent to ${emails}`);
    return { data: data };
  }
};
const sendMass = async (setCount, emails) => {
  try {
    const count = setCount > 0 ? setCount : 1;
    for (let i = 0; i < count; i++) {
      const { data, error } = await sendMassEmail(emails);
      if (error) {
        return { error: error, message: null };
      }
    }
    return { error: null, message: "success" };
  } catch (err) {
    logger.error(`Error sending email to ${emails}: ${err}`);
    return { error: err, message: null };
  }
};

export { sendMass };
