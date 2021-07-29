require('dotenv').config();
require('colors');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 10,
    maxMessages: 20,
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PWD,
    },
});

/**
 * @param {String} email
 * @param {String} subject
 * @param {String} message HTML
 * @param {Array} attachments [{filename: 'token.json',path: 'ATTENDO-TRIAL/token.json'}]
 * @param {number} id
 */
async function sendNoReplyMail(email, subject, message, attachments, id) {
    const mailOptions = {
        from: '"DSC MBCET" <dscmbcet@gmail.com>',
        to: email,
        subject,
        html: message,
        attachments,
    };

    await new Promise((resolve) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(`${id}: Error Occured While Sending Mail:`.red.bold, email, `\n${error.message}`.red);
                resolve();
            } else {
                console.log(`${id}: Mail Has Been Send:`.green.bold, email);
                resolve();
            }
        });
    });
}

module.exports = { sendNoReplyMail };
