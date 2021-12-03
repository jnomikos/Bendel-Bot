const fs = require('fs')

const getDirectories = (dir, suffix) => {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });

    let directories = [];
    for (const file of files) {
        if (file.isDirectory()) {
            directories.push(file.name);
        } //else if (file.name.endsWith(suffix)) {
        // commandFiles.push(`${dir}/${file.name}`);
        //}
    }
    return directories;
}

module.exports = getDirectories;