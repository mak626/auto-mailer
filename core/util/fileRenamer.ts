import fs from 'fs';

const fileDirPath = './data/Certificates/Participants';

const files = fs.readdirSync(fileDirPath);
files.forEach((eFile) => {
    const oldString = '- Le Debut';
    const newFile = eFile.replace(oldString, '');

    fs.renameSync(`${fileDirPath}/${eFile}`, `${fileDirPath}/${newFile}`);
});
