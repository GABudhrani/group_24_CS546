const express = require("express");
const { user } = require("../config/mongoCollections");
const router = express.Router();
const usersData = require("../data/users");
const meetData = require("../data/meeting");
const { v4: uuidv4 } = require("uuid");


router.get("/", async (req, res) => {
    res.render("sub_layout/intro");
});

router.get("/login", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    } else {
        res.render("sub_layout/login", { title: "Login", hasErrors: false });
    }
});

router.get("/home", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        res.status(200).render("sub_layout/home", { username: req.session.user.Username });
    }
});
router.get("/meeting", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        meetId = uuidv4();
        meetPass = meetData.makeid();
        const addmeet = await meetData.createmeet(meetId, meetPass);
        const addMeetuser = await usersData.addMeeting(req.session.user.Username);
        console.log(addMeetuser)
        if (addmeet.meetCreated && addMeetuser) {
            res.redirect(`/meeting/${meetId}/${meetPass}`);
        } else {
            res.status(400).render("sub_layout/home", {
                hasErrors: true,
                title: "Error",
                error: "unable to create a meet",
            });
            return;
        }
    }
});

router.post("/join", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    } else {
        try {
            meetId = req.body.room;
            meetPass = req.body.pass;
            const chckMeet = await meetData.checkMeet(meetId, meetPass);
            if (chckMeet.authenticated) {
                res.redirect(`/meeting/${meetId}/${meetPass}`);
            } else {
                res.status(400).render("sub_layout/home", {
                    hasErrors: true,
                    title: "Error",
                    error: "unable to join a meet",
                });
                return;
            }
        } catch (e) {
            res.status(400).render("sub_layout/home", {
                hasErrors: true,
                title: "Error",
                error: "unable to join a meet",
            });
        }
    }
});

router.get("/meeting/:room/:pass", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        try {
            meetId_ = req.params.room;
            meetPass = req.params.pass;
            const chckMeet = await meetData.checkMeet(meetId, meetPass);
            if (chckMeet.authenticated) {
                res.status(200).render("sub_layout/room", { roomId: req.params.room, username: req.session.user.Username });
            } else {
                res.status(400).render("sub_layout/home", {
                    hasErrors: true,
                    title: "Error",
                    error: "unable to join a meet",
                });
                return;
            }
        } catch (e) {
            res.status(400).render("sub_layout/home", {
                hasErrors: true,
                title: "Error",
                error: "unable to join a meet",
            });
        }
    }
});

router.get("/logout", async (req, res) => {
    user_logout = req.session.user.Username.toLowerCase();
    req.session.destroy();
    res.render("sub_layout/logout", { title: "Logout", username: user_logout });
});

router.post("/login", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        checkCreateUser(username, password);
        const userCheck = await usersData.checkUser(username, password);

        if (userCheck.authenticated) {
            req.session.user = { Username: username };
            res.redirect("/home");
            return;
        } else {
            res.status(400).render("sub_layout/login", {
                hasErrors: true,
                title: "Login",
                error: "Either the username or password is invalid",
            });
            return;
        }
    } catch (e) {
        if (Array.isArray(e)) {
            res.status(e[0]).render("sub_layout/login", {
                hasErrors: true,
                error: `${e[1]}`,
                title: "Login",
            });
        } else {
            res.status(500).render("sub_layout/login", {
                hasErrors: true,
                error: "Internal Server Error",
                title: "Login",
            });
            return;
        }
    }
});

router.get("/signup", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    } else {
        res.render("sub_layout/signup", { title: "Signup", hasErrors: false });
    }
});

router.get("/profile", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        try {
            const getUser = await usersData.getUser(req.session.user.Username);
            res.render("sub_layout/profile", {
                username: getUser.username,
                email: getUser.email,
                firstName: getUser.firstName,
                lastName: getUser.lastName,
                meetingList: getUser.meetings
            });
        } catch (e) {
        }
    }
});

router.get("/editprofile", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        try {
            const getUser = await usersData.getUser(req.session.user.Username);
            res.render("sub_layout/editprofile", {
                firstName: getUser.firstName,
                lastName: getUser.lastName
            });
        } catch (e) {
        }
    }
});

router.post("/editprofile", async (req, res) => {
    console.log("inside editprofile")
    try {

        let fname1 = req.body.firstName;
        let lname1 = req.body.lastName;

        const edituser = await usersData.editUser(req.session.user.Username, fname1, lname1);

        if (edituser) {
            return res.redirect("/profile");
        } else {
            return res.status(400).render("sub_layout/editprofile"),
            {
                hasErrors: true,
                error: "Error Occured"
            };
        }
    } catch (e) {
        res.status(e[0]).render("sub_layout/editprofile", {
            hasErrors: true,
            error: e[1]
        });
        return;
    }
});

router.post("/signup", async (req, res) => {
    try {
        let usernameSign = req.body.username;
        let passwordSign = req.body.password;
        let email = req.body.email;
        let fName = req.body.fName;
        let lName = req.body.lName;
        checkCreateUser(usernameSign, passwordSign);
        const adduser = await usersData.createUser(usernameSign, passwordSign, email, fName, lName);
        if (adduser.userInserted) {
            return res.redirect("/home");
        } else {
            res.status(400).render("sub_layout/signup"),
            {
                hasErrors: true,
                error: "Error Occured",
                title: "Signup",
            };
        }
        return;
    } catch (e) {
        res.status(e[0]).render("sub_layout/signup", {
            hasErrors: true,
            error: e[1],
            title: "Signup",
        });
        return;
    }
});


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
    if (pass.length < 6) throw [400, `Please enter a valid password(atleast 6 characters long)`];
};

module.exports = router;
