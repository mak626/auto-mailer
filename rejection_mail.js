require('colors');
const csv = require('csv-parser');
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const { devMail, backendMail } = require('./util/constants');
const { sendNoReplyMail } = require('./util/mailHandler');

/** @typedef {import('./models/model').Event} Event */
/** @typedef {import('./models/model').Person} Person */

async function csvParse() {
    const html = fs.readFileSync('./content.html', 'utf-8', () => {});

    const attachment = [
        {
            filename: 'dsc.png',
            path: './logo.png',
            cid: 'logo',
        },
        {
            filename: 'dsc-1.png',
            path: './gdsc.png',
            cid: 'gdsc',
        },
    ];

    let id = 1;
    const toLeft = [];
    toLeft.push(sendNoReplyMail(devMail, 'R21 | Final Phase Results', html.replace('<#NAME>', 'Backend'), attachment, id++));
    await new Promise((resolve) =>
        fs
            .createReadStream('./batch.csv')
            .pipe(csv())
            .on('data', (e) => {
                // toLeft.push(sendNoReplyMail(e.MAIL, 'R’21 | Final Phase Results', html.replace('<#NAME>', e.NAME), attachment, id++));
            })
            .on('end', () => {
                resolve();
            })
    );

    await Promise.all(toLeft);
}

(async () => {
    await csvParse();
    console.log('\nEmail Sending Done'.magenta.bold);
    process.exit(0);
})();
