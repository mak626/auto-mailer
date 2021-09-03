require('dotenv').config();

module.exports = {
    clientName: process.env.CLIENT_NAME,
    clientEmail: process.env.GOOGLE_USER,
    devMail: process.env.DEV_MAIL,
    leadMail: process.env.LEAD_MAIL,
    backendMail: process.env.BACKEND,
    coreMail: process.env.CORE_TEAM,
    iphoneMail: process.env.IPHONE_MAIL,
};
