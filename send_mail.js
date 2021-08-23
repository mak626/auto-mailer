require('colors');
const csv = require('csv-parser');
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const { devMail, backendMail, leadMail } = require('./util/constants');
const { htmlParser } = require('./util/html_parser');
const { sendNoReplyMail, MailtokenVerifed } = require('./util/mailHandler');

/** @typedef {import('../models/model').Event} Event */
/** @typedef {import('../models/model').Person} Person */

async function csvParse() {
    const subject = 'Subject Here';
    const attachment = [
        {
            filename: 'dsc.png',
            path: './temp/logo.png',
            cid: 'logo',
        },
        {
            filename: 'dsc-1.png',
            path: './temp/gdsc.png',
            cid: 'gdsc',
        },
    ];
    const html = htmlParser('./temp/content.html', attachment);

    let id = 1;
    const toLeft = [];
    toLeft.push(sendNoReplyMail(devMail, subject, html.replace('<#NAME>', 'MAK'), attachment, id++));
    // toLeft.push(sendNoReplyMail(leadMail, subject, html.replace('<#NAME>', 'Riya'), attachment, id++));
    await new Promise((resolve) =>
        fs
            .createReadStream('./temp/batch_temp.csv')
            .pipe(csv())
            .on('data', (e) => {
                // toLeft.push(sendNoReplyMail(e.MAIL, subject, html.replace('<#NAME>', e.NAME), attachment, id++));
            })
            .on('end', () => {
                resolve();
            })
    );

    await Promise.all(toLeft);
}

(async () => {
    await MailtokenVerifed;
    await csvParse();
    console.log('\nEmail Sending Done'.magenta.bold);
    process.exit(0);
})();
