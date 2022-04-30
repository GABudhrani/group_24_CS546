const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

const cookieParser = require('cookie-parser');
const session = require('express-session');
const configRoutes = require('./routes');
const static = express.static(__dirname + '/public');
const exphbs = require('express-handlebars');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === 'number')
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use;
app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.use(express.json());

app.use(
    session({
        name: 'AuthCookie',
        secret: "This is a secret.. shhh don't tell anyone",
        saveUninitialized: true,
        resave: false,
        cookie: { maxAge: 60000 }
    })
);

app.use("/peerjs", peerServer);
app.use(express.static("public"));

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
        socket.on("disconnect", () => {
            socket.to(roomId).broadcast.emit("user-disconnected", userId);
        });
    });
});

app.use(async (req, res, next) => {
    const now = new Date().toUTCString();
    let userStatus = 'Non-Authenticated User'
    if (req.session.user) {
        userStatus = 'Authenticated User'
    }
    console.log('[' + now + ']: ' + req.method + ' ' + req.originalUrl + ' (' + userStatus + ')');
    next();
});

app.all('/', (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/home');
    } else {
        next();
    }
});

app.use('/signup', (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/home');
    } else {
        next();
    }
});

app.use('/home', (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/notlogged');
    } else {
        next();
    }
});

app.use('/meeting', (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/notlogged');
    } else {
        next();
    }
});



configRoutes(app);

server.listen(process.env.PORT || 443);

// app.listen(4443, () => {
//     console.log("We've now got a server!");
//     console.log('Your routes will be running on http://localhost:4443');
// });
