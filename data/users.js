const { ObjectId } = require("mongodb");
const mongoCollections = require("../config/mongoCollections");
const userCollection = mongoCollections.user;
const bcrypt = require("bcryptjs");
const saltRound = 16;
const validations = require("../validations");

module.exports = {
    async createUser(username, password, email, fName, lName) {
        try {
            username = validations.checkField("username", username);
            fName = validations.checkField("First Name", fName);
            lName = validations.checkField("Last Name", lName);
            password = validations.checkPassword(password);
            email = validations.checkEmail(email);

            const usercol = await userCollection();
            const chckForUser = await usercol.findOne({ username: username });
            if (chckForUser) {
                throw [400, `Error: User Already Exists`];
            } else {
                let haspass = await bcrypt.hash(password, saltRound);
                const newUser = { username: username, password: haspass, email: email, firstName: fName, lastName: lName };
                const addUser = await usercol.insertOne(newUser);
                if (addUser) {
                    return { userInserted: true };
                } else {
                    throw [400, "Error: Couldn't add username"];
                }
            }
        } catch (e) {
            throw e;
        }
    },
    async checkUser(username, password) {
        try {
            username = validations.checkField("username", username);
            password = validations.checkPassword(password);

            const usercol = await userCollection();
            const chckForUser = await usercol.findOne({ username: username });
            if (chckForUser) {
                chckPassword = await bcrypt.compare(password, chckForUser.password);
                if (chckPassword) {
                    return { authenticated: true };
                } else {
                    throw [400, `Either the username or password is invalid`];
                }
            } else {
                throw [400, `Either the username or password is invalid".`];
            }
        } catch (e) {
            throw e;
        }
    },
};