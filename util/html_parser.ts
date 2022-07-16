import juice from 'juice';
import fs from 'fs';

/** @typedef {import('../types/model').Attachment} Attachement */

/**
 * @param {string} htmlFilePath
 * @param {Attachement[]} attachment
 *
 * Ensure src paths of image are absolute eg: ../temp/logo.png
 */
const htmlParser = (htmlFilePath: string) => {
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
    const html = fs.readFileSync(htmlFilePath, 'utf-8');
    let css = fs.readFileSync(htmlFilePath.replace('html', 'css'), 'utf-8');

    // Converting css variables to inline
    const reg = /--.*:.*;/gm;
    const varArray = css.matchAll(reg);

    for (const variable of varArray) {
        const [name, value] = variable[0].trim().replace(';', '').split(':');
        const regex = `var(${name.trim()})`;
        css = css.split(regex).join(value.trim());
    }

    // Inserting css data into html tags
    let parsedHtml = juice.inlineContent(html, css);

    // Renaming paths to cid format
    attachment.forEach((e) => {
        parsedHtml = parsedHtml.replace(`${e.cid}.png`, `cid:${e.cid}`);
    });
    return parsedHtml;
};

export default htmlParser;
