const callbackStyleFs = require('fs');
const path = require('path');

const lib = {};
const promisify = (func) => (...args) =>
    new Promise((resolve, reject) => {
        func(...args, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        })
    });

const fs = ['open', 'readFile', 'writeFile', 'close', 'truncate', 'unlink']
    .reduce((acc, methodName) => ({ ...acc, [methodName]: promisify(callbackStyleFs[methodName]) }), {});

lib.baseDir = path.join(__dirname, '/../data');

lib.create = async (dir, file, data) => {
    const fileDesc = await fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'wx');
    const stringData = JSON.stringify(data);

    await fs.writeFile(fileDesc, stringData);
    await fs.close(fileDesc);

    return false;
};

lib.read = async (dir, file) => {
    const data = await fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf8');
    return JSON.parse(data);
}

lib.update = async (dir, file, data) => {
    const filename = `${lib.baseDir}/${dir}/${file}.json`;
    fileDescriptor = await fs.open(filename, 'r+');

    await fs.truncate(fileDescriptor);
    const stringData = JSON.stringify(data);
    await fs.writeFile(fileDescriptor, stringData);
    await fs.close(fileDescriptor);
};

lib.delete = async (dir, file) => {
    const filename = `${lib.baseDir}/${dir}/${file}.json`;
    await fs.unlink(filename);
};

module.exports = lib;
