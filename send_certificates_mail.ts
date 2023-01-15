import type { CertificateConfig } from './core/types/config';
import sendCertificatedMail from './core/certificates_mail';

const CONFIG: CertificateConfig = {
    /** Generates debugging files events.json and mails.json at {debugFolderPath} */
    debugMode: true,

    /** Generates debugging files events.json and mails.json at {debugFolderPath} */
    debugFolderPath: './data/debug',

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

sendCertificatedMail(CONFIG)
    .then()
    .catch((e) => console.error(e));
