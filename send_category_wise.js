require('dotenv').config();
require('colors');
const csv = require('csv-parser');
const fs = require('fs');
const { sendNoReplyMail } = require('./util/mailHandler');
const devEmail = process.env.DEV_MAIL;

/** @typedef {import('./models/model').Event} Event */
/** @typedef {import('./models/model').Person} Person */

/**
 * @param {Person[]} personData
 * @param {string} eventName
 * @param {string} DataDirectoryPath
 * @param {string} attachmentFileType
 */
const sendMailCategoryWiseHandler = async (personData, eventName, DataDirectoryPath, attachmentFileType) => {
    const subject = 'Certificates for Le Début';
    let index = 0;
    const left = [];

    for (const person of personData) {
        const id = `${eventName}:${++index}`;
        const name = person.NAME.trim();
        const email = person.MAIL.trim();

        console.log(`${id}: Sending mail`.blue.bold, `${name} : ${email}`);

        const tempPath = `${DataDirectoryPath}/${name}.${attachmentFileType}`;

        if (!fs.existsSync(tempPath)) {
            console.log(`File For ${name} : ${email} Not Found`.yellow);
        } else {
            const html = fs.readFileSync('./content.html', 'utf-8', () => {});
            const attachment = [{ filename: `Le Début Participation Certificate.${attachmentFileType}`, path: tempPath }];
            left.push(sendNoReplyMail(devEmail, subject, html, attachment, id));
            // left.push(sendNoReplyMail(email, subject, html, attachment, id));
        }
    }
    await Promise.all(left);
};

async function csvParserSendCategory() {
    /** @type {Event[]} */
    let data = [{ EventName: 'Treasure Hunt' }, { EventName: 'Best Performed Team' }, { EventName: 'Participants' }];

    data = data.map((e) => ({
        EventName: e.EventName,
        FileName: `./data/CSV/${e.EventName}.csv`,
        DataDirectoryPath: `./data/Certificates/${e.EventName}`,
    }));

    for (const eventObject of data) {
        const results = [];
        await new Promise((resolve) =>
            fs
                .createReadStream(eventObject.FileName)
                .pipe(csv())
                .on('data', (e) => results.push(e))
                .on('end', async () => {
                    await sendMailCategoryWiseHandler(results, eventObject.EventName, eventObject.DataDirectoryPath, 'pdf');
                    resolve();
                })
        );
    }
}

(async () => {
    await csvParserSendCategory();
    console.log('Email Sending Done'.magenta.bold);
    process.exit(0);
})();
