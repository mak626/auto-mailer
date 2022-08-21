/* eslint-disable @typescript-eslint/unbound-method */
import 'colors';
import csv from 'csv-parser';
import fs from 'fs';
import rl from 'readline-sync';
import constants from './util/constants';
import type { MailCSV } from './types/csv';
import type { GeneralConfig } from './types/config';
import htmlParser from './util/html_parser';
import { sendNoReplyMail, MailtokenVerifed } from './util/mailHandler';
import { checkHeaders, getProperFirstName } from './util/parser';

// -------------------- CONFIGURATION --------------------

const CONFIG: GeneralConfig = {
    htmlPath: './temp/content.html',
    subject: 'SUBJECT_HERE',

    attachment: [
        // {
        //     filename: 'logo.png',
        //     path: './temp/logo.png',
        //     cid: 'logo',
        // },
        // {
        //     filename: 'banner.png',
        //     path: './temp/gdsc.png',
        //     cid: 'gdsc',
        // },
    ],

    batchFileListLocation: './temp/batch.csv',

    sendMailTo: {
        dev: true,
        backEnd: false,
        iphoneUser: false,
        coreTeam: false,
        lead: false,

        /** Enable this to send to send mails to everying in {batchFileListLocation} */
        batchListParticipants: false,
    },
};

// -------------------- CONFIGURATION --------------------

const { devMail, devName, backendMail, leadMail, coreMail, iphoneMail } = constants;

const showWarning = (sendMail: boolean, batchFileListLocation: string) => {
    if (sendMail) {
        console.log(`You are about to send mails to everyone in ${batchFileListLocation}`.red.bold);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return rl.keyInYN('Do you want to continue or abort') as boolean;
    }
    return true;
};

async function csvParse() {
    let id = 1;
    const toLeft = [];
    const { sendMailTo, subject, htmlPath, batchFileListLocation, attachment } = CONFIG;
    const html = htmlParser(htmlPath);

    if (!showWarning(sendMailTo.batchListParticipants, batchFileListLocation)) return;

    if (sendMailTo.dev && devMail && devName) {
        toLeft.push(sendNoReplyMail(devMail, subject, html.replace('<#NAME>', devName), attachment, id++));
    }
    if (sendMailTo.backEnd && backendMail) {
        toLeft.push(sendNoReplyMail(backendMail, subject, html.replace('<#NAME>', 'Backend'), attachment, id++));
    }
    if (sendMailTo.lead && leadMail) {
        toLeft.push(sendNoReplyMail(leadMail, subject, html.replace('<#NAME>', 'Riya'), attachment, id++));
    }
    if (sendMailTo.coreTeam && coreMail) {
        toLeft.push(sendNoReplyMail(coreMail, subject, html.replace('<#NAME>', 'Core Team'), attachment, id++));
    }
    if (sendMailTo.iphoneUser && iphoneMail) {
        toLeft.push(sendNoReplyMail(iphoneMail, subject, html.replace('<#NAME>', 'Salman'), attachment, id++));
    }

    await new Promise((resolve) => {
        const headers = ['NAME', 'MAIL'];
        fs.createReadStream(batchFileListLocation)
            .pipe(csv())
            .on('data', (e: MailCSV) => {
                if (!checkHeaders(headers, e)) {
                    return console.error(`CSV headers must be: ${headers.join(',')}`.red.bold);
                }
                if (sendMailTo.batchListParticipants) {
                    toLeft.push(sendNoReplyMail(e.MAIL, subject, html.replace('<#NAME>', getProperFirstName(e.NAME)), attachment, id++));
                }
            })
            .on('end', () => {
                resolve(null);
            });
    });

    await Promise.all(toLeft);
}

async function init() {
    await MailtokenVerifed;
    await csvParse();
    console.log('\nEmail Sending Done'.magenta.bold);
    process.exit(0);
}

init()
    .then()
    .catch((e) => console.error(e));
