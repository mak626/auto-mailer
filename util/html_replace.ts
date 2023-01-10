import type { Person } from '../types/model';
import { getProperFirstName } from './parser';

/**
 * Assigns the fieldData into html
 */
const htmlAssign = (html: string, fieldData: Person) => {
    const fields = Object.keys(fieldData);
    let parsedHtml = html;
    fields.forEach((e) => {
        const replaceRegex = new RegExp(`<#${e}>`, 'g');
        if (e === 'MAIL') return;
        if (e === 'NAME') {
            const name = getProperFirstName(fieldData.NAME);
            parsedHtml = parsedHtml.replace(replaceRegex, getProperFirstName(name));
        } else {
            parsedHtml = parsedHtml.replace(replaceRegex, fieldData[e].trim());
        }
    });

    return parsedHtml;
};

export default htmlAssign;
