const csv = require('csv-parser');
require('colors');
const fs = require('fs');
const { sendNoReplyMail } = require('./mailHandler');

/** @typedef {import('./models/treasurehunt').TreasureHunt} TreasureHunt */
/** @typedef {import('./models/treasurehunt').Data} Data */

const subject = `Certificates for Le Début`;

/** @type {Data} */
var datas = [{ EventName: 'Treasure Hunt' }, { EventName: 'Best Performed Team' }, { EventName: 'Participants' }];

datas = datas.map((e) => {
    return {
        EventName: e.EventName,
        FileName: `./data/CSV/${e.EventName}.csv`,
        DataDirectoryPath: `./data/Certificates/${e.EventName}`,
    };
});

/**
 *
 * @param {TreasureHunt[]} data
 * @param {string} eventName
 * @param {string} DataDirectoryPath
 * @param {string} attachmentFileType
 */
const sendMail = async (data, eventName, DataDirectoryPath, attachmentFileType) => {
    console.log(`Running ${eventName}`.green);
    data.forEach(async (person) => {
        const name = person.NAME.trim();
        const email = person.MAIL.trim();
        //console.log('Sending mail to'.blue.bold, `${name} : ${email}`);
        const tempPath = `${DataDirectoryPath}/${name}.${attachmentFileType}`;
        if (!fs.existsSync(tempPath)) {
            console.log(`File For ${name} : ${email} Not Found`.yellow);
        } else {
            const html = fs.readFileSync('./content.html', 'utf-8', () => {});
            const attachment = [{ filename: `Le Début Participation Certificate.${attachmentFileType}`, path: tempPath }];
        }
    });
};

datas.forEach((e) => {
    const results = [];
    fs.createReadStream(e.FileName)
        .pipe(csv())
        .on('data', (e) => results.push(e))
        .on('end', () => sendMail(results, e.EventName, e.DataDirectoryPath, 'pdf'));
});

//await sendNoReplyMail(email, subject, html, attachment);
