require('dotenv').config();
require('colors');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PWD,
    },
});

/**
 * Sends a no reply mail
 * @param {String} email
 * @param {String} subject
 * @param {String} message HTML
 * @param {Array} attachments [{filename: 'token.json',path: 'ATTENDO-TRIAL/token.json'}]
 */
async function sendNoReplyMail(email, subject, message, attachments) {
    console.log(`${email}: Pending`.bgMagenta.bold);

    const mailOptions = {
        from: '"DSC MBCET" <dscmbcet@gmail.com>',
        to: email,
        subject,
        html: message,
        attachments,
    };

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(`${email}: Error Occured While Sending Mail: ${error.message}`.red);
                reject(error);
            } else {
                console.log(`${email}: Mail Has Been Send`.green.bold);
                resolve();
            }
        });
    });
}

module.exports = { sendNoReplyMail };
