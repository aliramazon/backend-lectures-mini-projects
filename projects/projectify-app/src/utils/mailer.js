import nodemailer from "nodemailer";

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILER_ADDRESS,
                pass: process.env.MAILER_PASS,
            },
        });
    }
    send = async (mailOptions) => {
        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw error;
        }
    };

    sendActivationMail = async (emailAddress, token) => {
        try {
            this.send({
                to: emailAddress,
                subject: "Activate Your Account",
                html: `<a style="color: red;" href="http://localhost:4000/users/activate?activationToken=${token}">Verify your email</a>`,
            });
        } catch (error) {
            throw error;
        }
    };
}

export const mailer = new Mailer();

// const mailOptions = {
//     to: "turantech.web@gmail.com",
//     subject: "Activate your account",
//     text: "Hello, testing the connection",
// };

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: "turantech.web@gmail.com",
//         pass: "amdd wyrn fbox cixd",
//     },
// });
