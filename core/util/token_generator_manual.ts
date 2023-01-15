/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable camelcase */
import fs from 'fs';
import 'colors';
import { google } from 'googleapis';
import open from 'open';
import http from 'node:http';
import type { FirebaseCredential } from '../types/credential';

type Credentials = typeof google.auth.OAuth2.prototype.credentials;
type OAuth2Client = typeof google.auth.OAuth2.prototype;

const SCOPES = ['https://mail.google.com/'];
const TOKEN_PATH = './assets/tokens/mail.json';
const CLIENT_PATH = './assets/tokens/client.json';

let oAuth2Client: OAuth2Client;

function getNewToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize email by visiting this url:'.blue.bold, authUrl);
    open(authUrl)
        .then()
        .catch((e) => console.error(e));
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
// eslint-disable-next-line no-unused-vars
function authorize(credentials: FirebaseCredential, callback: (auth: OAuth2Client) => void) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[1] // localhost
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, { encoding: 'utf-8' }, (err, token) => {
        if (err) return getNewToken();
        oAuth2Client.setCredentials(JSON.parse(token) as Credentials);
        callback(oAuth2Client);
    });
}

const app = http.createServer((req, res) => {
    if (req?.url && req.url.includes('code')) {
        const url = new URL(`https://${req.headers.host}${req.url}`);
        const code = url.searchParams.get('code') as string;

        oAuth2Client
            .getToken(code)
            .then((e) => {
                const token = e.tokens;
                oAuth2Client.setCredentials(token);
                fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 4), (error) => {
                    if (error) return console.error(error);
                    console.log('Token stored to'.green.bold, TOKEN_PATH);
                    res.writeHead(200, 'Success');
                    res.end(`<h1>Success</h1><p>Token stored to${TOKEN_PATH}</p>`);
                });
            })
            .catch((err: any) => {
                const errorMessage = 'Error retrieving access token';
                console.error(errorMessage.red.bold, err);
                res.writeHead(401, 'Failed');
                res.end(`<h1>${errorMessage}</h1><p>${err.message}</p>`);
            });
    } else {
        res.writeHead(200).end();
    }
});

app.on('listening', () => {
    fs.readFile(CLIENT_PATH, { encoding: 'utf-8' }, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content) as FirebaseCredential, (authCode) => console.log(authCode));
    });
});

app.listen(3000);
