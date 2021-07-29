const csv = require('csv-parser');
require('colors');
const fs = require('fs');
const { sendNoReplyMail } = require('./mailHandler');

/** @typedef {import('./models/treasurehunt').TreasureHunt} TreasureHunt */
/** @typedef {import('./models/treasurehunt').Data} Data */

const subject = `Certificates for Le Début`;

/** @type {Data[]} */
var data = [{ EventName: 'Treasure Hunt' }, { EventName: 'Best Performed Team' }, { EventName: 'Participants' }];
data = data.map((e) => {
    return {
        EventName: e.EventName,
        FileName: `./data/CSV/${e.EventName}.csv`,
        DataDirectoryPath: `./data/Certificates/${e.EventName}`,
    };
});

/**
 * @param {TreasureHunt[]} data
 * @param {string} eventName
 * @param {string} DataDirectoryPath
 * @param {string} attachmentFileType
 */
const sendMailCategoryWise = async (data, eventName, DataDirectoryPath, attachmentFileType) => {
    console.log(`Running ${eventName}`.green);
    data.forEach(async (person) => {
        const name = person.NAME.trim();
        const email = person.MAIL.trim();
        console.log('Sending mail to'.blue.bold, `${name} : ${email}`);
        const tempPath = `${DataDirectoryPath}/${name}.${attachmentFileType}`;
        if (!fs.existsSync(tempPath)) {
            console.log(`File For ${name} : ${email} Not Found`.yellow);
        } else {
            const html = fs.readFileSync('./content.html', 'utf-8', () => {});
            const attachment = [{ filename: `Le Début Participation Certificate.${attachmentFileType}`, path: tempPath }];
        }
    });
};

/**
 * @param {Data[]} data
 */
const sendMailInvidually = (data, attachmentFileType) => {
    const html = fs.readFileSync('./content.html', 'utf-8', () => {});

    const participants = data.find((e) => e.EventName === 'Participants');
    const treasurehunt = data.find((e) => e.EventName === 'Treasure Hunt');
    const bestPerformedTeam = data.find((e) => e.EventName === 'Best Performed Team');

    participants.data.forEach(async (e) => {
        const name = e.NAME.trim();
        const email = e.MAIL.trim();
        console.log('Sending mail to'.blue.bold, `${name} : ${e.MAIL}`);
        const inBestPerformed = data.find((_e) => _e.EventName === 'Best Performed Team').data.find((__e) => __e.MAIL === e.MAIL);
        const inTreasureHunt = data.find((_e) => _e.EventName === 'Treasure Hunt').data.find((__e) => __e.MAIL === e.MAIL);

        let attachment = [];

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

        await sendNoReplyMail(email, subject, html, attachment);
    });
};

// CSV READING INVIDUAL
async function csvSendIndividual() {
    data = data.map(async (e) => {
        const results = [];
        const result = new Promise((resolve) => {
            fs.createReadStream(e.FileName)
                .pipe(csv())
                .on('data', (e) => results.push(e))
                .on('end', () => resolve(results));
        });
        return {
            ...e,
            data: await result,
        };
    });
    data = await Promise.all(data);
    sendMailInvidually(data, 'pdf');
}

csvSendIndividual();

// CSV READING
// data.forEach((e) => {
//     const results = [];
//     fs.createReadStream(e.FileName)
//         .pipe(csv())
//         .on('data', (e) => results.push(e))
//         .on('end', () => sendMailCategoryWise(results, e.EventName, e.DataDirectoryPath, 'pdf'));
// });
//await sendNoReplyMail(email, subject, html, attachment);
