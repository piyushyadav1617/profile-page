import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from 'dotenv'
dotenv.config();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;



/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {

    const { username, userEmail, text, subject } = req.body;

    const nodeConfig = {
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    }

    let transporter = nodemailer.createTransport(nodeConfig);

    let MailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Mailgen",
            link: 'https://mailgen.js/'
        }
    })

    let email = {
        body: {
            name: username,
            intro: text || 'Welcome to newSocial',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

    let emailBody = MailGenerator.generate(email)

    let message = {
        from: EMAIL,
        to: userEmail,
        subject: subject || "Signup Successful",
        html: emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us." })
        })
        .catch(error => res.status(500).send({ error: error.message }))

}

