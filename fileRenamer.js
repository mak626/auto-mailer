const fs = require('fs');

const file = fs.readdirSync(`./data/Certificates/Participants`);
file.forEach((file) => {
    const path = `./data/Certificates/Participants`;
    const newFile = file.replace('- Le Debut', '');

    fs.renameSync(`${path}/${file}`, `${path}/${newFile}`);
});
