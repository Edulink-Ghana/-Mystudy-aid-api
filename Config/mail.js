import { createTransport } from "nodemailer";

export const mailTransport = createTransport({
    host: "smtp.titan.email",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});