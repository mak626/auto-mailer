/* eslint-disable camelcase */
require('dotenv').config();
require('colors');
const fs = require('fs');
const nodemailer = require('nodemailer');

/** @typedef {import('nodemailer/lib/mailer').Attachment} Attachment */

const token = require('../assets/tokens/mail.json');
const { client_id, client_secret } = require('../assets/tokens/client.json').web;
const { clientEmail, clientName } = require('./constants');
const notSend = fs.createWriteStream('error_mails.log', { flags: 'a' });
let generated = false;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 5,
    maxMessages: 20,
    secure: true,
    rateLimit: 20,
    rateDelta: 60000,
    auth: {
        type: 'OAuth2',
        clientId: client_id,
        clientSecret: client_secret,
        user: clientEmail,
        refreshToken: token.refresh_token,
        accessToken: token.access_token,
        expires: token.expires_in,
    },
    // auth: {
    //     user: process.env.GOOGLE_USER,
    //     pass: process.env.GOOGLE_PWD,
    // },
});

transporter.on('token', (newToken) => {
    if (!generated) console.log('A new access token was generated'.yellow.bold);
    const data = { ...token, access_token: newToken.accessToken, expires_in: newToken.expires };
    fs.writeFileSync('./assets/tokens/mail.json', JSON.stringify(data, null, 2));
    generated = true;
});

const MailtokenVerifed = transporter.verify();

/**
 * @param {string|string[]} email
 * @param {String} subject
 * @param {String} message HTML/Text
 * @param {Attachment[]} attachments [{filename: 'NAME.pdf',path: 'Data/Certificate/NAME.pdf'}]
 * @param {number} id
 * @param {string|string[]=} ccMails
 * @param {string|string[]=} bccMails
 */
async function sendNoReplyMail(email, subject, message, attachments, id, ccMails, bccMails) {
    const mailOptions = {
        from: {
            name: clientName,
            address: clientEmail,
        },
        to: email,
        cc: ccMails,
        bcc: bccMails,
        subject,
        html: message,
        attachments,
    };

    console.log(`🔹 ${id}: Sending Mail To:`.blue.bold, email);

    await new Promise((resolve) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(`\n❌ ${id}: Error Occured While Sending Mail:`.red.bold, email, `\n${error.message}`.red);
                notSend.write(`[${new Date().toLocaleTimeString()}] ${id}: Sending Mail: ${email}, ERROR: ${error.message}\n`);
                resolve();
            } else {
                console.log(`✔  ${id}: Mail Has Been Send:`.green.bold, email);
                resolve();
            }
        });
    });
}

module.exports = { sendNoReplyMail, MailtokenVerifed };
