/* eslint-disable camelcase */
const http = require('http');
require('colors');
const fs = require('fs');
const { google } = require('googleapis');

const SCOPES = ['https://mail.google.com/'];
const TOKEN_PATH = './assets/tokens/mail.json';
const CLIENT_PATH = './assets/tokens/client.json';

let oAuth2Client;

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token
 */
function getNewToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize email by visiting this url:'.blue.bold, authUrl);
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[1] // localhost
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken();
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

const app = http.createServer((req, res) => {
    if (req.url.includes('code')) {
        const url = new URL(`${req.protocol}://${req.headers.host}${req.url}`);
        const code = url.searchParams.get('code');

        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                const errorMessage = 'Error retrieving access token';
                console.error(errorMessage.red.bold, err);
                res.writeHead(401, 'Failed');
                res.end(`<h1>${errorMessage}</h1><p>${err.message}</p>`);
                return;
            }
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 4), (e) => {
                if (e) return console.error(e);
                console.log('Token stored to'.green.bold, TOKEN_PATH);
                res.writeHead(200, 'Success');
                res.end(`<h1>Success</h1><p>Token stored to${TOKEN_PATH}</p>`);
            });
        });
    }
});

app.on('listening', () => {
    fs.readFile(CLIENT_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), (authCode) => console.log(authCode));
    });
});

app.listen(3000);
