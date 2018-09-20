const config = require('./config');
const crypto = require('crypto');

const hash = (str) => {
    if (typeof str === 'string' && str.trim().length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    }
}

module.exports = {
    hash
};