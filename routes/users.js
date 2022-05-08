const express = require("express");
const { user } = require("../config/mongoCollections");
const router = express.Router();
const usersData = require("../data/users");
const { v4: uuidv4 } = require("uuid");
const validations = require("../validations");

router.get("/", async(req, res) => {
    if (req.session.user) {
        return res.redirect("/home");
    } else {
        res.render("sub_layout/login", { title: "Login" });
    }
});
router.get("/home", async(req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    } else {
        res.status(200).render("sub_layout/home", { username: req.session.user.Username });
    }
});
router.get("/meeting", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    } else {
        res.redirect(`/meeting/${uuidv4()}`);
    }
});
router.get("/meeting/:room", async(req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    } else {
        res.status(200).render("sub_layout/room", { roomId: req.params.room, username: req.session.user.Username });
    }
});

router.get("/logout", async(req, res) => {
    user_logout = req.session.user.Username.toLowerCase();
    req.session.destroy();
    res.render("sub_layout/logout", { title: "Logout", username: user_logout });
});

router.post("/login", async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        username = validations.checkField("username", username);
        password = validations.checkPassword(password);
    } catch (e) {
        return res.status(400).render('sub_layout/login', {
            hasErrors: true,
            error: e,
            title: "Login",
        });
    }

    try {
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
router.get("/login", async(req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    } else {
        res.render("sub_layout/login", { title: "Login", hasErrors: false });
    }
});
router.get("/signup", async(req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    } else {
        res.render("sub_layout/signup", { title: "Signup", hasErrors: false });
    }
});
router.post("/signup", async(req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let fName = req.body.fName;
    let lName = req.body.lName;

    try {
        username = validations.checkField("username", username);
        fName = validations.checkField("First Name", fName);
        lName = validations.checkField("Last Name", lName);
        password = validations.checkPassword(password);
        email = validations.checkEmail(email);
    } catch (e) {
        return res.status(400).render('sub_layout/signup', {
            hasErrors: true,
            error: e,
            title: "Signup",
        });
    }

    try {
        const adduser = await usersData.createUser(username, password, email, fName, lName);
        if (adduser.userInserted) {
            // console.log(hi);
            return res.redirect("/");
        } else {
            res.status(400).render("sub_layout/signup"), {
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


module.exports = router;