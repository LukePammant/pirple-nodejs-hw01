const _data = require('./data');
const helpers = require('./helpers');
const { invalid, ok, notFound, error } = require('./requestHandler').responseMethods;

const isNullOrEmpty = (str) => {
    return (!str || (typeof str === "string" && str.trim().length === 0));
}

const post = async (requestData) => {
    const { firstName, lastName, email, password, phone } = requestData.json();
    if (isNullOrEmpty(firstName)) return invalid({ error: "First name is required" });
    if (isNullOrEmpty(lastName)) return invalid({ error: "Last name is required" });
    if (isNullOrEmpty(email)) return invalid({ error: "Email is required" });
    if (isNullOrEmpty(password)) return invalid({ error: "Password is required" });
    if (isNullOrEmpty(phone) || (phone && phone.trim().length < 10)) return invalid({ error: "Phone is required and should be 10 characters" });

    const userKey = phone.replace(/\D/g, '');
    const user = { firstName, lastName, email, phone, password: helpers.hash(password) }
    try {
        await _data.create('users', userKey, user);
        return ok({ message: "User successfully created." });
    } catch (e) {
        return error({ error: `User ${userKey} already exists` });
    }
}

const get = async (requestData) => {
    const { phone } = requestData.params;
    if (phone && phone.trim().length !== 10) {
        return invalid({ error: "Phone number is not valid. " });
    }

    const userKey = phone.replace(/\D/g, '');
    try {
        const user = await _data.read('users', userKey);
        delete user.password;
        return ok(user);
    } catch (e) {
        return notFound({ error: `User ${userKey} does not exist.` });
    }
}

const put = async (requestData) => {
    const { firstName, lastName, email, password, phone } = requestData.json();
    if (isNullOrEmpty(phone)) return invalid({ error: "Phone number is required." });

    if (isNullOrEmpty(firstName) && isNullOrEmpty(lastName) && isNullOrEmpty(email) && isNullOrEmpty(password))
        return invalid({ error: "Atleast first name, last name, email, or password is required." });

    const userKey = phone.replace(/\D/g, '');
    try {
        let user = await _data.read('users', userKey);

        try {
            if (firstName) user = { ...user, firstName };
            if (lastName) user = { ...user, lastName };
            if (email) user = { ...user, email };
            if (password) user = { ...user, password: helpers.hash(password) };

            await _data.update('users', userKey, user);
            return ok();
        } catch (e) {
            console.error(e);
            return error({error: "Failed to update user"});
        }

    } catch (e) {
        return notFound({ error: `User ${userKey} does not exist.` });
    }
}

const del = async (requestData) => {
    const { phone } = requestData.json();
    if (isNullOrEmpty(phone)) return invalid({ error: "Phone number is required." });

    const userKey = phone.replace(/\D/g, '');
    try {
        await _data.read('users', userKey);
        try{
            await _data.delete('users', userKey);
            return ok();
        } catch (e) {
            throw e;
        }
    } catch (e) {
        return notFound({ error: `User ${userKey} does not exist.` });
    }
}

module.exports = { post, get, put, delete: del };
