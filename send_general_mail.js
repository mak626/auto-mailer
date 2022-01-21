require('colors');
const csv = require('csv-parser');
const fs = require('fs');
const rl = require('readline-sync');

// eslint-disable-next-line no-unused-vars
const { devMail, devName, backendMail, leadMail, coreMail, iphoneMail } = require('./util/constants');
const { htmlParser } = require('./util/html_parser');
const { sendNoReplyMail, MailtokenVerifed } = require('./util/mailHandler');

const showWarning = (sendMailTo, batchFileListLocation) => {
    if (sendMailTo.batchListParticipants) {
        console.log(`You are about to send mails to everyone in ${batchFileListLocation}`.red.bold);
        return rl.keyInYN('Do you want to continue or abort');
    }
    return true;
};

async function csvParse() {
    // -------------------- CONFIGURATION --------------------

    const html = htmlParser('./temp/content.html');
    const subject = 'SUBJECT_HERE';
    const attachment = [
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
    ];

    const batchFileListLocation = './temp/batch.csv';

    const sendMailTo = {
        dev: true,
        backEnd: false,
        iphoneUser: false,
        coreTeam: false,
        lead: false,
        batchListParticipants: false, // BE CAREFUL ABOUT THIS
    };

    // -------------------- CONFIGURATION --------------------

    let id = 1;
    const toLeft = [];

    if (!showWarning(sendMailTo, batchFileListLocation)) return;

    if (sendMailTo.dev) toLeft.push(sendNoReplyMail(devMail, subject, html.replace('<#NAME>', devName), attachment, id++));
    if (sendMailTo.backEnd) toLeft.push(sendNoReplyMail(backendMail, subject, html.replace('<#NAME>', 'Backend'), attachment, id++));
    if (sendMailTo.lead) toLeft.push(sendNoReplyMail(leadMail, subject, html.replace('<#NAME>', 'Riya'), attachment, id++));
    if (sendMailTo.coreTeam) toLeft.push(sendNoReplyMail(coreMail, subject, html.replace('<#NAME>', 'Core Team'), attachment, id++));
    if (sendMailTo.iphoneUser) toLeft.push(sendNoReplyMail(iphoneMail, subject, html.replace('<#NAME>', 'Salman'), attachment, id++));

    await new Promise((resolve) =>
        fs
            .createReadStream(batchFileListLocation)
            .pipe(csv())
            .on('data', (e) => {
                if (sendMailTo.batchListParticipants) {
                    toLeft.push(sendNoReplyMail(e.MAIL, subject, html.replace('<#NAME>', e.NAME), attachment, id++));
                }
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
