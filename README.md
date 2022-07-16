# Auto Mailer

Parses data in csv, matches it to corresponding pdf and sends mail to people ( Certificate AUTOMATION )

## Pre Config Files

- `./assets/tokens/client.json`
- `./assets/tokens/mail.json` (Can be generated using `npm run generate-token`)

## .env Config

[Download](https://drive.google.com/drive/folders/1EvwqmuNksuRUwWCN28FU10LeqhgvOyp7?usp=sharing).

- `CLIENT_NAME`=serverEmailUsername
- `GOOGLE_USER`=serverEmailID
- `DEV_MAIL`=developerEmail
- `DEV_NAME`=developerName
- `BACKEND`=backendEmail
- `LEAD_MAIL`=leadEmail
- `CORE_TEAM`=coreTeamEmail
- `IPHONE_MAIL`=iphoneUserEmail

## Usage

### Installation

- `npm install`

### General Mail

- Create `temp` directory in `root`
- Add a `content.html`,`content.css`,`images` in `temp` directory for the mail message.
- Add a `batch.css` in temp directory for list of people to sent the mail to.
- Configure send_general_mail.js

### Certificates Mail

- Create `temp` directory in `root`
- Add a `content.html`,`content.css`,`images` in `temp` directory for the mail message.
- Refer `data-sample` for directory structure for certificates. Duplicate the same in `data` directory
- All the images/pdfs in `CERTIFICATES` should be in be as `EMAIL`.`datatype`
- A `Participants` event is mandatory which contains emails of all participants in `Participants.csv`
- `hasParticipantionCertificate` can be set to `true` in case participation certificates are there
- Configure send_certificates_events.js

    ```javascript
    /** Generates debugging files events.json and mails.json at {debugFolderPath} */
    debugMode: false,

    /** Generates debugging files events.json and mails.json at {debugFolderPath} */
    debugFolderPath: './data/temp',

    sendDevMail: false,
    subject: 'Email Subject Here',
    htmlPath: './temp/content.html',

    /** Path where the csv and other related data is stored. Must have the same structue of {data-sample} */
    dataPath: './data',

    /** A csv {Participants.csv} is mandatory for auto-mailer to work. It is a super set of all other csv events. */
    allParticipationEventName: 'Participants', // Mandatory Event

    /**
     * Since {Participants} event is mandatory, automailer will raise error if it could not find participant's certificates.
     * If the event does not have a participation certificate you can set {hasParticipantionCertificate} to false
     */
    hasParticipantionCertificate: true,

    /** Send mail To everyone in csv */
    sendMail: true,
    ```

- For Testing

    ```javascript
    debugMode = true;
    debugFolderPath = './data/temp';
    sendDevMail = false;
    ```

    `sendDevMail` can be set to `true` to send all mail to `DEV_MAIL`

    Testing will generate `events.json` and `mails.json` at `debugFolderPath` which can be used to verify what are the attachements being sent to participants
