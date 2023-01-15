import type { GeneralConfig } from './core/types/config';
import sendGeneralMail from './core/general_mail';

const CONFIG: GeneralConfig = {
    htmlPath: './temp/content.html',
    subject: 'SUBJECT_HERE',

    attachment: [
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
    ],

    batchFileListLocation: './temp/batch.csv',

    /*
        If the html has more fields to replace other than <#NAME> mention here
        This is only needed for testing mails like: dev, backEnd, coreTeam.. etc

        For participants you need to mention these in the CSV Data of participants
        eg: NAME,MAIL,REDEEM_CODE
            MAK,m@gmail.com,testing123

    */
    extraHtmlReplaceFields: {
        // REDEEM_CODE: '1234', // This will replace <#REDEEM_CODE> with the value '1234' in the html
    },

    sendMailTo: {
        dev: true,
        backEnd: false,
        iphoneUser: false,
        coreTeam: false,
        lead: false,

        /** Enable this to send to send mails to everything in {batchFileListLocation} */
        batchListParticipants: false,
    },
};

sendGeneralMail(CONFIG)
    .then()
    .catch((e) => console.error(e));
