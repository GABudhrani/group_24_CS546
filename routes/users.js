const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const { v4: uuidv4 } = require("uuid");

router.get("/", async (req, res) => {
    res.status(200).render("users/firstpage", {});
});

router.get("/login", async (req, res) => {
    res.status(200).render("users/login", {});
});

router.get("/signup", async (req, res) => {
    res.status(200).render("users/signup", {});
});

router.post("/signup", async (req, res) => {
    let { username, password } = req.body;

    try {
        if (!username || !password) throw "Username or password not provided at routes";

        if (username.trim().length === 0) throw "Username cannot be an empty string or string with just spaces";

        if (hasWhiteSpace(username)) throw "Username cannot have spaces";

        if (!username.match(/^[a-z0-9]+$/i)) throw "Username can contain only alphanumeric characters";

        if (username.length < 4) throw "Username should be atleast 4 characters long";

        if (password.trim().length === 0) throw "Password cannot be an empty string or string with just spaces";

        if (hasWhiteSpace(password)) throw "Password cannot have spaces";

        if (password.length < 6) throw "Password should be atleast 6 characters long";
    } catch (e) {
        console.log(e);
        res.status(400).render("users/signup", { error: e, hasErrors: true });
        return;
    }

    try {
        const user = await userData.createUser(username, password);
        console.log(user);
        if (user["userInserted"] === true) {
            res.status(200).redirect("/");
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    } catch (e) {
        console.log(e);
        res.status(400).render("users/signup", { error: e, hasErrors: true });
    }
});

router.post("/login", async (req, res) => {
    let { username, password } = req.body;

    try {
        if (!username || !password) throw "Username or password not provided at routes";

        if (username.trim().length === 0) throw "Username cannot be an empty string or string with just spaces";

        if (hasWhiteSpace(username)) throw "Username cannot have spaces";

        if (!username.match(/^[a-z0-9]+$/i)) throw "Username can contain only alphanumeric characters";

        if (username.length < 4) throw "Username should be atleast 4 characters long";

        if (password.trim().length === 0) throw "Password cannot be an empty string or string with just spaces";

        if (hasWhiteSpace(password)) throw "Password cannot have spaces";

        if (password.length < 6) throw "Password should be atleast 6 characters long";
    } catch (e) {
        console.log(e);
        res.status(400).render("users/login", { error: e, hasErrors: true });
        return;
    }

    try {
        const user = await userData.checkUser(username, password);
        console.log(user);

        req.session.user = { username: username };

        res.status(200).redirect("/home");
    } catch (e) {
        console.log(e);
        res.status(400).render("users/login", { error: e, hasErrors: true });
    }
});

router.get("/home", async (req, res) => {
    res.status(200).render("users/home", { username: req.session.user.username });
});

router.get("/logout", async (req, res) => {
    req.session.destroy();
    res.status(200).render("users/logout");
});

router.get("/notlogged", async (req, res) => {
    res.status(403).render("users/notlogged");
});

router.get("/meeting", (req, res) => {
    res.redirect(`/meeting/${uuidv4()}`);
});

router.get("/meeting/:room", async (req, res) => {
    console.log(req.params.room);
    res.status(200).render("users/room", { roomId: req.params.room });
});

function hasWhiteSpace(s) {
    return s.indexOf(" ") >= 0;
}

module.exports = router;
