const fs = require('fs');
const juice = require('juice');

/** @typedef {import('../models/model').Attachement} Attachement */

/**
 * @param {string} htmlFilePath
 * @param {Attachement[]} attachment
 *
 * Ensure src paths of image are absolute eg: ../temp/logo.png
 */
const htmlParser = (htmlFilePath, attachment) => {
    const html = fs.readFileSync(htmlFilePath, 'utf-8', () => {});
    const css = fs.readFileSync(htmlFilePath.replace('html', 'css'), 'utf-8', () => {});

    let parsedHtml = juice.inlineContent(html, css);

    attachment.forEach((e) => {
        parsedHtml = parsedHtml.replace(`.${e.path}`, `cid:${e.cid}`);
    });
    return parsedHtml;
};

module.exports = { htmlParser };
