const socket = io("/", {
    transports: ["polling"],
});
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
const ROOM_ID = document.getElementById("room").getAttribute("data-roomid");
myVideo.muted = true;

backBtn.addEventListener("click", () => {
    document.querySelector(".main__left").style.display = "flex";
    document.querySelector(".main__left").style.flex = "1";
    document.querySelector(".main__right").style.display = "none";
    document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
    document.querySelector(".main__right").style.display = "flex";
    document.querySelector(".main__right").style.flex = "1";
    document.querySelector(".main__left").style.display = "none";
    document.querySelector(".header__back").style.display = "block";
});

const user = document.getElementById("room").getAttribute("usernameJ");
// alert(user);
video = "";
var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

let myVideoStream;
navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            video.setAttribute("id", call.peer);
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });
        socket.on("user-disconnected", (userId) => {
            // alert("user disconnected ss" + userId);
            removeuser(userId, stream);
        });
    });
const removeuser = (userId, stream) => {
    const call = peer.call(userId, stream);
    document.getElementById(call.peer).remove();
};
const connectToNewUser = (userId, stream) => {
    // alert("User Joined" + userId);
    const call = peer.call(userId, stream);
    video = document.createElement("video");
    video.setAttribute("id", call.peer);
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

const removeVideoStream = (video, stream) => {
    // alert(video + "user disconnected final");
};
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
});

function leaveMeet() {
    window.location.replace("/");
}

inviteButton.addEventListener("click", (e) => {
    prompt("Copy this link and send it to people you want to meet with", window.location.href);
});

socket.on("createMessage", (message, userName) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
        <span>${message}</span>
    </div>`;
});


/*************Login & signup validation **************/

let username = document.getElementById("username");
let password = document.getElementById("password");
let email = document.getElementById("email");
let fName = document.getElementById("fName");
let lName = document.getElementById("lName");

username = checkField("username", username);
password = checkPassword(password);
email = checkEmail(email);
fName = checkField("First Name", fName);
lName = checkField("Last Name", lName);

function checkField(fieldName, fieldValue) {
    if (!fieldValue) throw `Error: You must supply a ${fieldName}!`;
    if (typeof fieldValue !== 'string') throw `Error: ${fieldName} must be a string!`;
    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0)
        throw `Error: ${fieldName} cannot be an empty string or string with just spaces`;
    if (fieldValue.includes(' ')) {
        throw `Error: ${fieldName} should not contain any spaces`;
    }
    fieldValue = fieldValue.toLowerCase();
    return fieldValue;
};

function checkEmail(email) {
    if (!email) throw `Error: You must supply an email}!`;
    if (typeof email !== 'string') throw `Error: email must be a string!`;
    email = email.trim();
    if (email.length === 0)
        throw `Error: email cannot be an empty string or string with just spaces`;
    if (email.includes(' ')) {
        throw `Error: email should not contain any spaces`;
    }
    if (!this.validateEmail(email)) {
        throw `Error: Enter a valid email`
    }
    email = email.toLowerCase();
    return email;
}

function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

function checkPassword(password) {
    if (!password) throw `Error: You must supply a password!`;
    if (typeof password !== 'string') throw `Error: password must be a string!`;
    password = password.trim();
    if (password.length === 0)
        throw `Error: Password cannot be an empty string or string with just spaces`;
    if (password.length < 6)
        throw `Error: Password should be atleat 6 characters long`;
    if (password.includes(' ')) {
        throw 'Error: Password should not contain any spaces';
    }
    return password;
}

/************ Login & signup validation **************/