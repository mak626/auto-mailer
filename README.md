# Auto Mailer

Parses data in csv, matches it to corresponding pdf and sends mail to people ( Certificate AUTOMATION )

# .env CONIFIG

-   `CLIENT_NAME`=serverEmailUsername
-   `GOOGLE_USER`=serverEmailID
-   `DEV_MAIL`=developerEmail
-   `DEV_NAME`=developerName
-   `BACKEND`=backendEmail
-   `LEAD_MAIL`=leadEmail
-   `CORE_TEAM`=coreTeamEmail
-   `IPHONE_MAIL`=iphoneUserEmail

# Usage

#### Installation

-   `npm i`

#### General Mail

-   Create `temp` directory in `root`
-   Add a `content.html`,`content.css`,`images` in `temp` directory for the mail message.
-   Add a `batch.css` in temp directory for list of people to sent the mail to.
-   Configure send_general_mail.js

#### Certificates Mail

-   Create `temp` directory in `root`
-   Add a `content.html`,`content.css`,`images` in `temp` directory for the mail message.
-   Refer `data-sample` for directory structure for certificates. Duplicate the same in `data` directory
-   All the images/pdfs in `CERTIFICATES` should be in be as `EMAIL`.`datatype`
-   A `Participants` event is mandatory which contains emails of all participants in `Participants.csv`
-   `hasParticipantionCertificate` can be set to `true` in case participation certificates are there
-   Configure send_certificates_events.js

    ```
    debugMode = false;
    debugFolderPath = './data/temp';
    sendDevMail = false;

    subject = 'Email Subject';
    htmlPath = './temp/content.html';
    dataPath = './data';

    allParticipationEventName = 'Participants';
    hasParticipantionCertificate = false;

    sendMail = true;
    ```

-   For Testing

    ```
    debugMode = true;
    debugFolderPath = './data/temp';
    sendDevMail = false;
    ```

    `sendDevMail` can be set to `true` to send all mail to `DEV_MAIL`

    Testing will generate `events.json` and `mails.json` at `debugFolderPath` which can be used to verify what are the attachements being sent to participants
