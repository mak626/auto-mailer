/* eslint-disable camelcase */
require('dotenv').config();
require('colors');
const nodemailer = require('nodemailer');

const token = require('../tokens/mail.json');
const { client_id, client_secret } = require('../tokens/client.json').web;
const client_email = process.env.GOOGLE_USER;

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
        user: client_email,
        refreshToken: token.refresh_token,
        accessToken: token.access_token,
    },
    // auth: {
    //     user: process.env.GOOGLE_USER,
    //     pass: process.env.GOOGLE_PWD,
    // },
});

transporter.on('token', (newToken) => {
    console.log('A new access token was generated'.red);
    console.log(newToken);
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
        from: `"DSC MBCET" <${client_email}>`,
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
