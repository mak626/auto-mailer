/* eslint-disable camelcase */
require('dotenv').config();
require('colors');
const nodemailer = require('nodemailer');

const token = require('../assets/tokens/mail.json');
const { client_id, client_secret } = require('../assets/tokens/client.json').web;
const { clientEmail, clientName } = require('./constants');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 10,
    maxMessages: 20,
    secure: true,
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
    console.log('A new access token was generated'.red);
    console.log(JSON.stringify(newToken, null, 1));
});

transporter.on('idle', () => {
    console.log('bored');
});

/**
 * @param {String} email
 * @param {String} subject
 * @param {String} message HTML
 * @param {Array} attachments [{filename: 'NAME.pdf',path: 'Data/Certificate/NAME.pdf'}]
 * @param {number} id
 */
async function sendNoReplyMail(email, subject, message, attachments, id) {
    const mailOptions = {
        from: `"${clientName}" <${clientEmail}>`,
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
