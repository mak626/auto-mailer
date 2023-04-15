# Auto Mailer

Parses data in events csv, matches and verifies it to the corresponding pdf, then groups it by email and sends it.

## Pre Config Files

- `./assets/tokens/client.json` : Firebase project credentials. Ensure GMAIL Api is enabled.
- `./assets/tokens/mail.json` (Can be generated using `npm run generate-token`)

## .env Config

- `CLIENT_NAME`=serverEmailUsername
- `GOOGLE_USER`=serverEmailID
- `DEV_MAIL`=developerEmail
- `DEV_NAME`=developerName
- The following are for GDSC MBCET Testing mails. U can substitute your own mails here.
  - `BACKEND`=backendEmail
  - `LEAD_MAIL`=leadEmail
  - `LEAD_NAME`=leadName
  - `CORE_TEAM`=coreTeamEmail
  - `IPHONE_MAIL`=iphoneUserEmail
  - `IPHONE_NAME`=iphoneUserName

## Usage

### Clone the repo
- `git clone https://github.com/mak626/revanced.git`

### Installation

- `npm install`

### General Mail

- Create `temp` directory in `root`
- Add a `content.html`, `content.css`, `images` in `temp` directory for the mail message.
- Add a `batch.csv` in temp directory for list of people to sent the mail to.
- Configure `send_general_mail.ts`
- Run `npm run-script send_individual`

### Certificates Mail

- Create `temp` directory in `root`
- Add a `content.html`, `content.css`, `images` in `temp` directory for the mail message.
- Refer `data-sample` for directory structure for certificates. Duplicate the same folder as `data` directory
- All the images or pdfs in `CERTIFICATES` should have the name in format `EMAIL`.`datatype`
- A `Participants` event is mandatory which contains emails of all participants in `Participants.csv`
- `hasParticipationCertificate` can be set to `true` in case participation certificates are there
- The `Common` folder in `Certificates` contains the files that need to be attached to everyone. The file names must be mentioned in `common.csv`
- Configure `send_certificates_events.ts`.

    ```javascript
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
    ```

- If additional params need to be replaced in html other than <#NAME>, add them as CSV headers in `participants.csv`

    ```csv
    NAME,MAIL,REDEEM_CODE
    MAK,m@gmail.com,testing123
    ```

- Run `npm run-script send_certificate_events`

- For Testing

    ```javascript
    debugMode = true;
    debugFolderPath = './data/debug';
    sendDevMail = false;
    ```

    `sendDevMail` can be set to `true` to send all mail to `DEV_MAIL`

    Testing will generate following files at `debugFolderPath` can be used to verify what are the attachments being sent to participants.
  - `events.json` : Info about the various events
  - `common.json` : Info about the common files attached to every participant
  - `mails.json` : (Most useful for debugging) Info about what is being sent to each participant
