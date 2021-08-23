/* eslint-disable prefer-spread */
/* eslint-disable no-undef */
require('dotenv').config();
require('colors');
const csv = require('csv-parser');
const fs = require('fs');
const { sendNoReplyMail, MailtokenVerifed } = require('./util/mailHandler');
// eslint-disable-next-line no-unused-vars
const { devMail, backendMail } = require('./util/constants');
const { htmlParser } = require('./util/html_parser');

/** @typedef {import('./models/model').Event} Event */

/**
 * @param {Event[]} eventData
 * @param {string} attachmentFileType
 */
const sendMailInviduallyHandler = async (eventData, attachmentFileType) => {
    const html = htmlParser('./temp/content.html');
    const subject = 'Certificates for Le Début';

    const participants = eventData.find((e) => e.EventName === 'Participants');
    const treasurehunt = eventData.find((e) => e.EventName === 'Treasure Hunt');
    const bestPerformedTeam = eventData.find((e) => e.EventName === 'Best Performed Team');

    let index = 0;
    const left = [];

    for (const e of participants.data) {
        const id = ++index;
        const name = e.NAME;
        const email = e.MAIL;

        console.log(`${id}: Sending mail`.blue.bold, `${name} : ${e.MAIL}`);

        const inBestPerformed = eventData.find((_e) => _e.EventName === 'Best Performed Team').data.find((__e) => __e.MAIL === e.MAIL);
        const inTreasureHunt = eventData.find((_e) => _e.EventName === 'Treasure Hunt').data.find((__e) => __e.MAIL === e.MAIL);

        const attachment = [];

        if (!fs.existsSync(`${participants.DataDirectoryPath}/${name}.${attachmentFileType}`)) {
            console.log(`Le Début Participation File For ${name} : ${email} Not Found`.yellow);
        }
        attachment.push({
            filename: `Le Début Participation Certificate.${attachmentFileType}`,
            path: `${participants.DataDirectoryPath}/${name}.${attachmentFileType}`,
        });

        if (inBestPerformed) {
            const tempPath = `${bestPerformedTeam.DataDirectoryPath}/${name}.${attachmentFileType}`;
            if (!fs.existsSync(tempPath)) {
                console.log(`BestPerformed File For ${name} : ${email} Not Found`.yellow);
            }
            attachment.push({
                filename: `Best Performed Team Certificate.${attachmentFileType}`,
                path: tempPath,
            });
        }

        if (inTreasureHunt) {
            const tempPath = `${treasurehunt.DataDirectoryPath}/${name}.${attachmentFileType}`;
            if (!fs.existsSync(tempPath)) {
                console.log(`Treasure Hunt File For ${name} : ${email} Not Found`.yellow);
            }
            attachment.push({
                filename: `Treasure Hunt Certificate.${attachmentFileType}`,
                path: tempPath,
            });
        }

        left.push(sendNoReplyMail(devMail, subject, html, attachment, id));
        // left.push(sendNoReplyMail(email, subject, html, attachment, id));
    }

    await Promise.all(left);
};

async function csvParserSendIndividual() {
    /** @type {Event[]} */
    let data = await new Promise((resolve) => {
        const temp = [];
        fs.createReadStream('./data/events.csv')
            .pipe(csv())
            .on('data', (e) => {
                const EventName = e.EventName.trim();
                temp.push({
                    EventName,
                    FileName: `./data/CSV/${EventName}.csv`,
                    DataDirectoryPath: `./data/Certificates/${EventName}`,
                });
            })
            .on('end', () => resolve(temp));
    });

    data = data.map(async (eventObject) => {
        const results = [];
        const result = new Promise((resolve) => {
            fs.createReadStream(eventObject.FileName)
                .pipe(csv())
                .on('data', (e) =>
                    results.push({
                        NAME: e.NAME.trim(),
                        MAIL: e.MAIL.trim(),
                    })
                )
                .on('end', () => resolve(results));
        });
        return {
            ...eventObject,
            data: await result,
        };
    });

    data = await Promise.all(data);
    console.log(JSON.stringify(data, null, 2));

    const attachmentFileType = 'pdf';
    await sendMailInviduallyHandler(data, attachmentFileType);
}

(async () => {
    await MailtokenVerifed;
    await csvParserSendIndividual();
    console.log('Email Sending Done'.magenta.bold);
    process.exit(0);
})();
