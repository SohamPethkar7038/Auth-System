import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,              
    secure: false,          // TLS via STARTTLS
    auth: {
        user: process.env.SMTP_USER,     // Brevo login
        pass: process.env.SMTP_PASSWORD, // SMTP key (NOT your account password)
    },
});

export default transporter;
