const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const { json } = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 14;

let exportedMethods = {

    async createUser(username, password) {

        if (!username || !password) throw 'All fields need to have valid values';

        if (username.trim().length === 0)
            throw 'Username cannot be an empty string or string with just spaces';

        if (hasWhiteSpace(username))
            throw 'Username cannot have spaces';

        if (!username.match(/^[a-z0-9]+$/i))
            throw 'Username can contain only alphanumeric characters';

        if (username.length < 4)
            throw 'Username should be atleast 4 characters long';

        const duplicate = await this.findByName(username);

        if (duplicate.length > 0)
            throw 'User already exists';

        if (password.trim().length === 0)
            throw 'Password cannot be an empty string or string with just spaces';

        if (hasWhiteSpace(password))
            throw 'Password cannot have spaces';

        if (password.length < 6)
            throw 'Password should be atleast 6 characters long';

        const hash = await bcrypt.hash(password, saltRounds);

        const userCollection = await users();

        let newUser = {
            username: username,
            password: hash
        };

        const insertInfo = await userCollection.insertOne(newUser);

        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw 'Could not add user';

        const newId = insertInfo.insertedId.toString();

        const user = await this.get(newId);

        let res = {
            "userInserted": true
        }

        return res;
    },

    async get(id) {
        if (!id) throw 'You must provide an id to search for';
        if (typeof id !== 'string') throw 'Id must be a string';
        if (id.trim().length === 0)
            throw 'Id cannot be an empty string or just spaces';
        id = id.trim();
        if (!ObjectId.isValid(id)) throw 'invalid object ID';

        const userCollection = await users();
        const user = await userCollection.findOne({ _id: ObjectId(id) });
        if (user === null) throw 'No user with that id';
        user._id = user._id.toString();

        return user;
    },

    async findByName(username) {
        if (!username) throw 'You must provide a name';
        const userCollection = await users();
        return await userCollection
            .find({ 'username': { $regex: new RegExp(username, "i") } })
            .toArray();
    },

    async getUser(username) {
        if (username === undefined) throw 'You must provide an username';
        const userCollection = await users();
        const user = await userCollection.findOne({ 'username': { $regex: new RegExp(username, "i") } });

        if (!user) {
            throw 'Either the username or password is invalid';
        }
        return user;
    },

    async checkUser(username, password) {

        if (!username || !password) throw 'All fields need to have valid values';

        if (username.trim().length === 0)
            throw 'Username cannot be an empty string or string with just spaces';

        if (hasWhiteSpace(username))
            throw 'Username cannot have spaces';

        if (!username.match(/^[a-z0-9]+$/i))
            throw 'Username can contain only alphanumeric characters';

        if (username.length < 4)
            throw 'Username should be atleast 4 characters long';

        if (password.trim().length === 0)
            throw 'Password cannot be an empty string or string with just spaces';

        if (hasWhiteSpace(password))
            throw 'Password cannot have spaces';

        if (password.length < 6)
            throw 'Password should be atleast 6 characters long';

        const user = await this.getUser(username);
        const dbPassword = user["password"];

        let compareToMerlin = false;
        try {
            compareToMerlin = await bcrypt.compare(password, dbPassword);
        } catch (e) {
            //no op
        }

        if (compareToMerlin) {
            let res = {
                "authenticated": true
            }
            return res;
        } else {
            throw 'Either the username or password is invalid';
        }

    }
};

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}

module.exports = exportedMethods;
