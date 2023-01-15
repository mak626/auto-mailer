/* eslint-disable @typescript-eslint/unbound-method */
import 'colors';
import csv from 'csv-parser';
import fs from 'fs';
import rl from 'readline-sync';
import constants from './util/constants';
import type { GeneralConfig } from './types/config';
import htmlParser from './util/html_parser';
import { sendNoReplyMail, MailTokenVerified } from './util/mailHandler';
import { checkHeaders } from './util/parser';
import type { Person } from './types/model';
import htmlAssign from './util/html_replace';

// -------------------- CONFIGURATION --------------------

const { devMail, devName, backendMail, leadMail, leadName, coreMail, iphoneMail, iphoneName } = constants;

const showWarning = (sendMail: boolean, batchFileListLocation: string) => {
    if (sendMail) {
        console.log(`You are about to send mails to everyone in ${batchFileListLocation}`.red.bold);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return rl.keyInYN('Do you want to continue or abort') as boolean;
    }
    return true;
};

async function csvParse(CONFIG: GeneralConfig) {
    let id = 1;
    const toLeft = [];
    const { sendMailTo, subject, htmlPath, batchFileListLocation, attachment } = CONFIG;
    const html = htmlParser(htmlPath);

    const { extraHtmlReplaceFields } = CONFIG;

    if (sendMailTo.dev && devMail && devName) {
        toLeft.push(
            sendNoReplyMail(
                devMail,
                subject,
                htmlAssign(html, { ...extraHtmlReplaceFields, NAME: devName, MAIL: devMail }),
                attachment,
                id++
            )
        );
    }
    if (sendMailTo.backEnd && backendMail) {
        toLeft.push(
            sendNoReplyMail(
                backendMail,
                subject,
                htmlAssign(html, { ...extraHtmlReplaceFields, NAME: 'Backend', MAIL: backendMail }),
                attachment,
                id++
            )
        );
    }
    if (sendMailTo.lead && leadMail && leadName) {
        toLeft.push(
            sendNoReplyMail(
                leadMail,
                subject,
                htmlAssign(html, { ...extraHtmlReplaceFields, NAME: leadName, MAIL: leadMail }),
                attachment,
                id++
            )
        );
    }
    if (sendMailTo.coreTeam && coreMail) {
        toLeft.push(
            sendNoReplyMail(
                coreMail,
                subject,
                htmlAssign(html, { ...extraHtmlReplaceFields, NAME: 'Core Team', MAIL: coreMail }),
                attachment,
                id++
            )
        );
    }
    if (sendMailTo.iphoneUser && iphoneMail && iphoneName) {
        toLeft.push(
            sendNoReplyMail(
                iphoneMail,
                subject,
                htmlAssign(html, { ...extraHtmlReplaceFields, NAME: iphoneName, MAIL: iphoneMail }),
                attachment,
                id++
            )
        );
    }

    let printedHeaders = false;
    if (!showWarning(sendMailTo.batchListParticipants, batchFileListLocation)) return;

    await new Promise((resolve) => {
        const headers = ['NAME', 'MAIL'];
        fs.createReadStream(batchFileListLocation)
            .pipe(csv())
            .on('data', (e: Person) => {
                if (!checkHeaders(headers, e)) {
                    return console.error(`CSV headers must have: ${headers.join(',')}`.red.bold);
                }
                if (!printedHeaders) {
                    console.log(
                        `The params replaced in html : ${Object.keys(e)
                            .map((_e) => `<#${_e}>`)
                            .join(' ')}`.blue.bold
                    );
                    printedHeaders = true;
                }
                if (sendMailTo.batchListParticipants) {
                    toLeft.push(sendNoReplyMail(e.MAIL, subject, htmlAssign(html, e), attachment, id++));
                }
            })
            .on('end', () => {
                resolve(null);
            });
    });

    await Promise.all(toLeft);
}

async function sendGeneralMail(CONFIG: GeneralConfig) {
    await MailTokenVerified;
    await csvParse(CONFIG);
    console.log('\nEmail Sending Done'.magenta.bold);
    process.exit(0);
}

export default sendGeneralMail;
