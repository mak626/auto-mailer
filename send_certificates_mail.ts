/* eslint-disable @typescript-eslint/unbound-method */
import csv from 'csv-parser';
import fs from 'fs';
import rl from 'readline-sync';
import 'colors';
import type Mail from 'nodemailer/lib/mailer';
import type { Event, Person } from './types/model';
import type { CommonCSV, EventsCSV, EventsCSVStream } from './types/csv';
import type { CertificateConfig } from './types/config';
import { sendNoReplyMail, MailTokenVerified } from './util/mailHandler';
import constants from './util/constants';
import htmlParser from './util/html_parser';
import { checkHeaders, getProperFirstName } from './util/parser';
import htmlAssign from './util/html_replace';

// ------------------CONFIGURATION-----------------------------

const CONFIG: CertificateConfig = {
    /** Generates debugging files events.json and mails.json at {debugFolderPath} */
    debugMode: true,

    /** Generates debugging files events.json and mails.json at {debugFolderPath} */
    debugFolderPath: './data/temp',

    sendDevMail: false,
    subject: 'Email Subject Here',
    htmlPath: './temp/content.html',

    /** Path where the csv and other related data is stored. Must have the same structure of {data-sample} */
    dataPath: './data',

    /** A csv {Participants.csv} is mandatory for auto-mailer to work. It is a super set of all other csv events. */
    allParticipationEventName: 'Participants', // Mandatory Event

    /**
     * Since {Participants} event is mandatory, auto-mailer will raise error if it could not find participant's certificates.
     * If the event does not have a participation certificate you can set {hasParticipationCertificate} to false
     */
    hasParticipationCertificate: true,

    /**
     * If you have any common files that need to attached to everyone
     * Add the files to the {Certificates/Common} folder and set {hasCommonFiles} to true
     * The file names must be mentioned in {common.csv}
     */
    hasCommonFiles: true,

    /** Send mail To everyone in csv */
    sendMail: false,
};

// ------------------END: CONFIGURATION-----------------------------

const { devMail } = constants;

const showWarning = (batchFileListLocation: string) => {
    if (CONFIG.sendMail) {
        console.log(`You are about to send mails to everyone in ${batchFileListLocation}`.red.bold);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return rl.keyInYN('Do you want to continue or abort') as boolean;
    }
    return true;
};

const sendMailIndividualHandler = async (eventData: Event[], commonData: Mail.Attachment[]) => {
    const html = htmlParser(CONFIG.htmlPath);
    const { data: participants } = eventData.find((e) => e.EventName === CONFIG.allParticipationEventName) ?? { data: [] };
    if (participants.length === 0) return console.error('Participants are empty'.red.bold);

    let index = 0;
    const left = [];
    const debugData = [];

    for (const participant of participants) {
        const id = ++index;
        const { NAME: name, MAIL: email } = participant;
        const attachment: Mail.Attachment[] = [...(CONFIG.hasCommonFiles ? commonData : [])];

        console.log(`${CONFIG.debugMode ? '\n' : ''}${id}: Processing mail`.blue.bold, `${name} : ${participant.MAIL}`);

        eventData.forEach((currentEvent) => {
            // Check if participation certificate is there
            if (currentEvent.EventName === CONFIG.allParticipationEventName && !CONFIG.hasParticipationCertificate) return;

            // Check if participant is part of current event
            const inCurrentEvent = currentEvent.data.find((person) => person.MAIL === participant.MAIL);
            if (!inCurrentEvent) return;

            // If participant is in current event, then attach the certificate
            const tempPath = `${currentEvent.DataDirectoryPath}/${email}.${currentEvent.FileType}`;
            if (!fs.existsSync(tempPath)) {
                console.error(`${currentEvent.EventName} File Not Found at ${tempPath}`.red.bold);
            } else {
                attachment.push({
                    filename: `${currentEvent.CertificateName}.${currentEvent.FileType}`,
                    path: tempPath,
                });
            }
        });

        if (CONFIG.sendMail) {
            const call = sendNoReplyMail(participant.MAIL, CONFIG.subject, htmlAssign(html, participant), attachment, id);
            left.push(call);
        }
        if (CONFIG.sendDevMail) {
            if (!devMail) console.error('ENV devMail not found'.red.bold);
            else {
                const call = sendNoReplyMail(devMail, CONFIG.subject, htmlAssign(html, { ...participant, MAIL: devMail }), attachment, id);
                left.push(call);
            }
        }

        if (CONFIG.debugMode) {
            const htmlReplaceFields: { [field: string]: string } = {};
            Object.keys(participant).forEach((e) => {
                htmlReplaceFields[`<#${e}>`] = participant[e];
            });

            const data = {
                participant: participant.MAIL,
                attachment,
                htmlReplaceFields,
            };
            debugData.push(data);
        }
    }

    if (CONFIG.debugMode) {
        console.debug(`\nGenerated mails.json at ${CONFIG.debugFolderPath}/mails.json`.yellow.bold);
        fs.writeFileSync(`${CONFIG.debugFolderPath}/mails.json`, JSON.stringify(debugData, null, 4));
    }
    await Promise.all(left);
};

async function csvParserSendIndividual() {
    const headersEvents = ['EventName', 'CertificateName', 'FileType'];
    const headersCommon = ['FileName', 'CertificateName', 'FileType'];
    const headersPerson = ['NAME', 'MAIL'];

    const eventDataCSV: EventsCSVStream[] = await new Promise((resolve) => {
        const temp: EventsCSVStream[] = [];

        fs.createReadStream(`${CONFIG.dataPath}/events.csv`)
            .pipe(csv())
            .on('data', (e: EventsCSV) => {
                if (!checkHeaders(headersEvents, e)) {
                    return console.error(`events.csv headers must have: ${headersEvents.join(',')}`.red.bold);
                }
                const EventName = e.EventName.trim();
                const CertificateName = e.CertificateName.trim();
                const FileType = e.FileType.trim();
                temp.push({
                    EventName,
                    CertificateName,
                    FileType,
                    FileName: `${CONFIG.dataPath}/CSV/${EventName}.csv`,
                    DataDirectoryPath: `${CONFIG.dataPath}/Certificates/${EventName}`,
                });
            })
            .on('end', () => resolve(temp));
    });

    let printedHeaders = false;

    const eventData = await Promise.all(
        eventDataCSV.map(async (eventObject) => {
            const result: Person[] = await new Promise((resolve) => {
                const results: Person[] = [];
                fs.createReadStream(eventObject.FileName)
                    .pipe(csv())
                    .on('data', (e: Person) => {
                        if (!checkHeaders(headersPerson, e)) {
                            return console.error(`${eventObject.FileName} headers must have: ${headersPerson.join(',')}`.red.bold);
                        }
                        if (!printedHeaders) {
                            console.log(
                                `The params replaced in html : ${Object.keys(e)
                                    .map((_e) => `<#${_e}>`)
                                    .join(' ')}`.blue.bold
                            );
                            printedHeaders = true;
                        }
                        const email = e.MAIL.trim();

                        if (results.find((person) => person.MAIL === email)) {
                            console.log(`Skipping Duplicate Email: ${email}`.red.bold);
                        } else {
                            results.push({
                                ...e,
                                NAME: getProperFirstName(e.NAME),
                                MAIL: email,
                            });
                        }
                    })
                    .on('end', () => resolve(results));
            });
            return {
                ...eventObject,
                data: result,
            };
        })
    );

    let commonData: Mail.Attachment[] = [];

    if (CONFIG.hasCommonFiles) {
        commonData = await new Promise((resolve) => {
            const temp: Mail.Attachment[] = [];
            fs.createReadStream(`${CONFIG.dataPath}/common.csv`)
                .pipe(csv())
                .on('data', (e: CommonCSV) => {
                    if (!checkHeaders(headersCommon, e)) {
                        return console.error(`common.csv headers must have: ${headersCommon.join(',')}`.red.bold);
                    }
                    const fileName = e.FileName.trim();
                    const fileType = e.FileType.trim();
                    const certificateName = e.CertificateName.trim();
                    const path = `${CONFIG.dataPath}/Certificates/Common/${fileName}.${fileType}`;

                    if (!fs.existsSync(path)) {
                        console.error(`Common File: ${fileName} File Not Found at ${path}`.red.bold);
                    } else {
                        temp.push({
                            filename: `${certificateName}.${fileType}`,
                            path,
                        });
                    }
                })
                .on('end', () => resolve(temp));
        });
    }

    if (commonData.length > 0 && CONFIG.hasCommonFiles) {
        console.log(`Added ${commonData.length} common attachments to all the mails`.blue.bold);
    }

    if (CONFIG.debugMode) {
        fs.writeFileSync(`${CONFIG.debugFolderPath}/events.json`, JSON.stringify(eventData, null, 4));
        fs.writeFileSync(`${CONFIG.debugFolderPath}/common.json`, JSON.stringify(commonData, null, 4));
        console.debug(`Generated events.json at ${CONFIG.debugFolderPath}/events.json`.yellow.bold);
        console.debug(`Generated common.json at ${CONFIG.debugFolderPath}/common.json`.yellow.bold);
    }
    await sendMailIndividualHandler(eventData, commonData);
}

async function init() {
    await MailTokenVerified;
    if (!showWarning(CONFIG.dataPath)) return;
    await csvParserSendIndividual();
    if (CONFIG.sendMail || CONFIG.sendDevMail) console.log('Email Sending Done'.magenta.bold);
    process.exit(0);
}

init()
    .then()
    .catch((e) => console.error(e));
