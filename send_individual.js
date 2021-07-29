require('dotenv').config();
require('colors');
const csv = require('csv-parser');
const fs = require('fs');
const { sendNoReplyMail } = require('./util/mailHandler');
const devEmail = process.env.DEV_MAIL;

/** @typedef {import('./models/model').Event} Event */

/**
 * @param {Event[]} eventData
 * @param {string} attachmentFileType
 */
const sendMailInviduallyHandler = async (eventData, attachmentFileType) => {
    const html = fs.readFileSync('./content.html', 'utf-8', () => {});
    const subject = 'Certificates for Le Début';

    const participants = eventData.find((e) => e.EventName === 'Participants');
    const treasurehunt = eventData.find((e) => e.EventName === 'Treasure Hunt');
    const bestPerformedTeam = eventData.find((e) => e.EventName === 'Best Performed Team');

    let index = 0;
    const left = [];

    for (const e of participants.data) {
        const id = ++index;
        const name = e.NAME.trim();
        const email = e.MAIL.trim();

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

        left.push(sendNoReplyMail(devEmail, subject, html, attachment, id));
        // left.push(sendNoReplyMail(email, subject, html, attachment, id));
    }

    await Promise.all(left);
};

async function csvParserSendIndividual() {
    /** @type {Event[]} */
    let data = [{ EventName: 'Treasure Hunt' }, { EventName: 'Best Performed Team' }, { EventName: 'Participants' }];

    data = data.map((e) => ({
        EventName: e.EventName,
        FileName: `./data/CSV/${e.EventName}.csv`,
        DataDirectoryPath: `./data/Certificates/${e.EventName}`,
    }));

    data = data.map(async (eventObject) => {
        const results = [];
        const result = new Promise((resolve) => {
            fs.createReadStream(eventObject.FileName)
                .pipe(csv())
                .on('data', (e) => results.push(e))
                .on('end', () => resolve(results));
        });
        return {
            ...eventObject,
            data: await result,
        };
    });
    data = await Promise.all(data);

    await sendMailInviduallyHandler(data, 'pdf');
}

(async () => {
    await csvParserSendIndividual();
    console.log('Email Sending Done'.magenta.bold);
    process.exit(0);
})();
