const express = require("express");
const { user } = require("../config/mongoCollections");
const router = express.Router();
const usersData = require("../data/users");
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

router.get("/meeting", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        res.redirect(`/meeting/${uuidv4()}/${usersData.makeid()}`);
    }
});

router.get("/profile", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        res.redirect(`sub_layout/profile`);
    }
});

router.post("/join", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    } else {
        res.redirect(`/meeting/${req.body.room}/${req.body.pass}`);
    }
});

router.get("/meeting/:room/:pass", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        res.status(200).render("sub_layout/room", { roomId: req.params.room, username: req.session.user.Username });
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

router.post("/signup", async (req, res) => {
    try {
        // console.log("hi");
        let usernameSign = req.body.username;
        let passwordSign = req.body.password;
        checkCreateUser(usernameSign, passwordSign);
        const adduser = await usersData.createUser(usernameSign, passwordSign);
        if (adduser.userInserted) {
            // console.log(hi);
            return res.redirect("/");
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
        // console.log(e[1]);
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
