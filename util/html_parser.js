const fs = require('fs');
const juice = require('juice');

/** @typedef {import('../models/model').Attachement} Attachement */

/**
 * @param {string} htmlFilePath
 * @param {Attachement[]} attachment
 *
 * Ensure src paths of image are absolute eg: ../temp/logo.png
 */
const htmlParser = (htmlFilePath) => {
    const attachment = [
        {
            path: './temp/logo.png',
            cid: 'logo',
        },
        {
            path: './temp/gdsc.png',
            cid: 'gdsc',
        },
    ];
    const html = fs.readFileSync(htmlFilePath, 'utf-8', () => {});
    let css = fs.readFileSync(htmlFilePath.replace('html', 'css'), 'utf-8', () => {});

    // Adding css variables to inline
    const reg = /--.*:.*;/gm;
    const varArray = css.matchAll(reg);

    for (const variable of varArray) {
        const [name, value] = variable[0].trim().replace(';', '').split(':');
        const regex = `var(${name.trim()})`;
        css = css.split(regex).join(value.trim());
    }

    let parsedHtml = juice.inlineContent(html, css);

    attachment.forEach((e) => {
        parsedHtml = parsedHtml.replace(`.${e.path}`, `cid:${e.cid}`);
    });
    return parsedHtml;
};

module.exports = { htmlParser };
