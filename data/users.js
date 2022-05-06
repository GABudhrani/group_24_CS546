const { ObjectId } = require("mongodb");
const mongoCollections = require("../config/mongoCollections");
const userCollection = mongoCollections.user;
const bcrypt = require("bcryptjs");
const saltRound = 16;
const makeid = function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};
module.exports = {
    makeid,
    async createUser(username, password, email, fName, lName) {
        try {
            checkCreateUser(username, password);
            username = username.trim();
            username = username.toLowerCase();
            password = password.trim();

            const usercol = await userCollection();
            const chckForUser = await usercol.findOne({ username: username });
            if (chckForUser) {
                throw [400, `User Already Exists`];
            } else {
                let haspass = await bcrypt.hash(password, saltRound);
                const newUser = { username: username, password: haspass, email: email, firstName: fName, lastName: lName };
                const addUser = await usercol.insertOne(newUser);
                if (addUser) {
                    return { userInserted: true };
                } else {
                    throw [400, "Couldn't add username"];
                }
            }
        } catch (e) {
            throw e;
        }
    },
    async checkUser(username, password) {
        try {
            checkCreateUser(username, password);
            username = username.trim();
            username = username.toLowerCase();
            password = password.trim();
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
const checkCreateUser = function checkCreateUser(user, pass) {
    if (!user) throw [400, `Please provide a username`];
    if (!pass) throw [400, `Please provide a passowrd`];
    if (typeof user !== "string") throw [400, `Please pass only characters in an Username`];
    if (!user.replace(/\s/g, "").length) throw [400, `Please don't pass only white spaces`];
    if (!/^[a-zA-Z]+$/.test(user)) throw [400, `Please input only charaters in an Username`];
    if (user.length < 4) throw [400, `Please enter a valid username(atleast 4 characters long)`];
    if (typeof pass !== "string") throw [400, `Please pass only characters in an password`];
    if (!pass.replace(/\s/g, "").length) throw [400, `Please don't pass white spaces in password`];
    if (/\s/.test(pass)) throw [400, `Please input only charaters in an Password`];
    if (pass.length < 6) throw [400, `Please enter a valid password(atleast 4 characters long)`];
};
