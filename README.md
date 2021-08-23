# Auto Mailer

Parses data in csv, matches it to corresponding pdf and sends mail to people ( Certificate AUTOMATION )

# .env CONIFIG

-   `CLIENT_NAME`=serverEmailUsername
-   `GOOGLE_USER`=serverEmailID
-   `DEV_MAIL`=developerEmail
-   `BACKEND`=backendEmail
-   `LEAD_MAIL`=leadEmail

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
-   Refer `models/data-TEMPLATE` for directory structure. Do the same in `data` directory
-   Configure send_certificates_events.js
