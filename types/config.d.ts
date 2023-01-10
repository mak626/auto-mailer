import Mail from 'nodemailer/lib/mailer';

export interface CertificateConfig {
    debugMode: boolean;
    debugFolderPath: string;
    sendDevMail: boolean;
    subject: string;
    htmlPath: string;
    dataPath: string;
    allParticipationEventName: string;
    hasParticipationCertificate: boolean;
    sendMail: boolean;
}

export interface GeneralConfig {
    htmlPath: string;
    subject: string;
    attachment: Mail.Attachment[];
    batchFileListLocation: string;
    sendMailTo: {
        dev: boolean;
        backEnd: boolean;
        iphoneUser: boolean;
        coreTeam: boolean;
        lead: boolean;
        batchListParticipants: boolean; // BE CAREFUL ABOUT THIS
    };
}
