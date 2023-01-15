/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable camelcase */
import { config } from 'dotenv';

import 'colors';
import fs from 'fs';
import nodemailer from 'nodemailer';

import type Mail from 'nodemailer/lib/mailer';
import token from '../../assets/tokens/mail.json';
import webToken from '../../assets/tokens/client.json';
import constants from './constants';
config();
const { client_id, client_secret } = webToken.web;
const { clientEmail, clientName } = constants;

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
        expires: token.expiry_date,
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

export const MailTokenVerified = transporter.verify();

export const sendNoReplyMail = async (
    email: string | string[],
    subject: string,
    message: string,
    attachments: Mail.Attachment[],
    id: number,
    ccMails?: string | string[],
    bccMails?: string | string[]
) => {
    if (!clientName || !clientEmail) return console.error('ENV For clientName & clientEmail Not Found'.red.bold);

    const mailOptions: Mail.Options = {
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
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✔  ${id}: Mail Has Been Send:`.green.bold, email);
    } catch (error: any) {
        console.error(`\n❌ ${id}: Error Occurred While Sending Mail:`.red.bold, email, `\n${error.message}`.red);
        notSend.write(`[${new Date().toLocaleTimeString()}] ${id}: Sending Mail: ${email}, ERROR: ${error.message}\n`);
    }
};
