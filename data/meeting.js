const { ObjectId } = require("mongodb");
const mongoCollections = require("../config/mongoCollections");
const meetCollection = mongoCollections.meet;

const bcrypt = require("bcryptjs");
const saltRound = 12;
const makeid = function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};
module.exports = {
    makeid,
    async createmeet(meetId, meetPass) {
        try {
            const meetcol = await meetCollection();
            let haspass = await bcrypt.hash(meetPass, saltRound);

            const newMeet = {
                meetId: meetId,
                meetPassword: haspass,
                DateStartTime: new Date().toUTCString(),
            };
            const addMeet = await meetcol.insertOne(newMeet);

            if (addMeet) {
                return { meetCreated: true };
            } else {
                throw [400, "Couldn't add Meeting"];
            }
        } catch (e) {
            throw e;
        }
    },
    async checkMeet(meetIdValue, meetPass) {
        try {
            const meetcol = await meetCollection();
            const chckForMeet = await meetcol.findOne({ meetId: meetIdValue });
            if (chckForMeet) {
                chckPassword = await bcrypt.compare(meetPass, chckForMeet.meetPassword);
                if (chckPassword) {
                    return { authenticated: true };
                } else {
                    throw [400, `Meet Id & password dosen't match`];
                }
            } else {
                throw [400, `Meet Id & password dosen't match`];
            }
        } catch (e) {
            throw e;
        }
    },
};
