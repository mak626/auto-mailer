import { config } from 'dotenv';
config();

const constants = {
    clientName: process.env.CLIENT_NAME,
    clientEmail: process.env.GOOGLE_USER,
    devMail: process.env.DEV_MAIL,
    devName: process.env.DEV_NAME,
    leadMail: process.env.LEAD_MAIL,
    backendMail: process.env.BACKEND,
    coreMail: process.env.CORE_TEAM,
    iphoneMail: process.env.IPHONE_MAIL,
};

export default constants;
