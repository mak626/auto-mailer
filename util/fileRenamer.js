const fs = require('fs');

const filePath = './data/Certificates/Participants';
const file = fs.readdirSync(filePath);

file.forEach((eFile) => {
    const oldString = '- Le Debut';
    const newFile = eFile.replace(oldString, '');

    fs.renameSync(`${filePath}/${eFile}`, `${filePath}/${newFile}`);
});
