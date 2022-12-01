import { getSelectedColor, setTimer, onCancel, initPlaceBtn } from './ui.js';

const mousePosition = { x: 0.0, y: 0.0};
const canvasStartPosition = {x: 0.0 , y: 0.0};
const currentCanvasPosition = {x: 0.0 , y: 0.0};
let PLACEWIDTH = 400;
let PLACEHEIGHT = 400;
let CONTAINERWIDTH = PLACEWIDTH * 2;
let CONTAINERHEIGHT = PLACEHEIGHT * 2;
// let COOLDOWN = 120000;
// Also needs to be set in firebase DB rules.
let COOLDOWN = 10000;
export { COOLDOWN };
let UID = 0;

const availableSpace = {x: CONTAINERWIDTH - PLACEWIDTH - 1, y: CONTAINERHEIGHT - PLACEHEIGHT - 1};
const drag = document.getElementById('drag');
const container = document.getElementById('zoom');
const zoom = document.getElementById('zoom');
const placeBtn = document.getElementById('place-btn');
const confirmBtn = document.getElementById('confirm');
// The entire game area where mouse events are registered (excluding the UI)
const game = document.getElementById('game');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

game.addEventListener("mousedown", onMouseDown, false);
game.addEventListener("mouseleave", onLeave, false);
game.addEventListener("mouseenter", onEnter, false);
confirmBtn.addEventListener("click", placeTile, false);
placeBtn.addEventListener("click", smoothZoom, false);

// Need to add mouseup listener to window instead of div, so it reconginzes the mouseup event after courser has left the window
window.addEventListener("mouseup", onMouseUp, false);
window.addEventListener("wheel", onWheel, false);
window.onresize = resize;

drag.style.width = PLACEWIDTH + "px";
drag.style.height = PLACEHEIGHT + "px";

canvas.width = PLACEWIDTH;
canvas.height = PLACEHEIGHT;

container.style.height = CONTAINERHEIGHT + "px";
container.style.width = CONTAINERWIDTH + "px";

let leftclick = false;
let zoomFactor = 4;
let maxZoom = 40;


const crosshair2 = document.getElementById('crosshair2');
const coordinates = document.getElementById('coordinates');


let containerRect = container.getBoundingClientRect();

// The last time this client placed a pixel
let placeTimeStamp = 0;
export { placeTimeStamp };


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onChildAdded, onChildChanged, set, get, child, serverTimestamp } from "firebase/database";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    // Use your own API-key here :)
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
// const db = getFirestore(app);
const db = getDatabase(app);


async function writeToDb(id, timeStamp, userId, color) {
    set(ref(db, "pixels/" + id), {
        timeStamp: timeStamp,
        userId: userId,
        color: color
    });

}

function signIn() {
    const auth = getAuth(app);
    signInAnonymously(auth)
    .then(() => {
        // Signed in..
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("error signing in");
        alert("error signing in");
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          UID = user.uid;
          checkUser();
          // ...
        } else {
          // User is signed out
          // ...
          console.log("signed out");
        }
      });

}

async function insertUid(id, coords, color) {
    var userRef = ref(db, "users/" + id);
    set(userRef, {
        timeStamp: serverTimestamp()
    })
    .then(() => {
        get(userRef).then((snapshot) => {
            writeToDb(coords, snapshot.val().timeStamp, id, color);
        })
        .catch((error) => {
            console.log(error);
        })
    })
    .catch((error) => {
        alert("UserId insert failed.");
        console.log(error);
    });
    // if deny. then stop placing pixel...
}

async function secureInsert(coords, color) {
    const dbRef = ref(getDatabase());
    const currentTime = + new Date();
    get(child(dbRef, `users/${UID}`)).then((snapshot) => {
    if (snapshot.exists()) {
        // If cooldown is over
        if (!currentTime - snapshot.val().timeStamp < COOLDOWN) {
            insertUid(UID, coords, color);
        }
    } else {
        // New User
        insertUid(UID, coords, color);
        console.log('new user entered');
    }
    }).catch((error) => {
        console.error(error);
    });
}

async function checkUser() {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${UID}`)).then((snapshot) => {
    if (snapshot.exists()) {
        const difference = + new Date() - snapshot.val().timeStamp;
        if (difference < COOLDOWN) {
            placeTimeStamp = snapshot.val().timeStamp;
            setTimer();
        } else {
            initPlaceBtn();
        }
    } else {
        placeTimeStamp = + new Date();
        setTimer();
    }
    }).catch((error) => {
        console.error(error);
    });
}

function listenToDb () {
    const pixelsRef = ref(db, 'pixels');
    onChildAdded(pixelsRef, (data) => {
        ctx.fillStyle = data.val().color;
        var coords = data.key.split(' ');
        ctx.fillRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);
      });
      
      onChildChanged(pixelsRef, (data) => {
        ctx.fillStyle = data.val().color;
        var coords = data.key.split(' ');
        ctx.fillRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);
      });
}


function placeTile(e) {

    if (+ new Date() - placeTimeStamp > COOLDOWN) {
        let targetX =  PLACEWIDTH - Math.round(canvasStartPosition.x) - 1;
        let targetY = PLACEHEIGHT - Math.round(canvasStartPosition.y) - 1;
        ctx.fillStyle = getSelectedColor();

        moveCrosshair();

        secureInsert(targetX + " " + targetY, ctx.fillStyle);

        ctx.fillRect(targetX, targetY, 1, 1);
        placeTimeStamp = + new Date();
        setTimer();
        onCancel();
    } else {
        alert("Client on cooldown");
    }
}

function smoothZoom() {
    var myInterval = setInterval(function () {
        if (zoomFactor < maxZoom) {
            zoomFactor++;
            resize();
        }
        else {
            clearInterval(myInterval);
        }
    }, 20);
}

function moveCrosshair() {

    let targetX =  PLACEWIDTH - Math.round(currentCanvasPosition.x) - 1;
    let targetY = PLACEHEIGHT - Math.round(currentCanvasPosition.y) - 1;
    // Insert current coordinates into UI
    coordinates.textContent = "(" + targetX + " ," + targetY + ") " + zoomFactor / 8 + "x";

    let top = containerRect.top + (currentCanvasPosition.y + targetY)*zoomFactor -1;
    let left = containerRect.left + (currentCanvasPosition.x + targetX)*zoomFactor -1;

    crosshair2.style.transform = "translate(" + left + "px, " + top + "px)";
}

function resize() {
    zoom.style.transform = "translateX(-50%) scale(" + zoomFactor + ")";
    containerRect = container.getBoundingClientRect();

    // Only show crosshair if zoomlevel is sufficient
    if (zoomFactor < 10) {
        crosshair2.style.display = "none";
    } else {
        crosshair2.style.display = "block";
    }
    
    crosshair2.style.width = zoomFactor + "px";
    crosshair2.style.height = zoomFactor + "px";
    moveCrosshair();

}


// Move canvas to specified coordiantes
const moveCanvas = (x, y) => {
    // Make sure canvas stays within container bounds
    if (x < 0) {x = 0};
    if (y < 0) {y = 0};
    if (x > availableSpace.x) {x = availableSpace.x};
    if (y > availableSpace.y) {y = availableSpace.y};

    drag.style.transform = "translate(" + x + "px, " + y + "px)";
    currentCanvasPosition.x = x;
    currentCanvasPosition.y = y;

    moveCrosshair();
}

function onMouseDown(e) {
    e.preventDefault();
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    
    // Add move listener
    game.addEventListener("mousemove", onMove, false);
    leftclick = true;
}

function onMouseUp(e) {
    // Remove move listener
    game.removeEventListener("mousemove", onMove, false);
    leftclick = false;

    // Read new canvas position
    const transformStyle = drag.style.transform.replace(/[^\d.,]/g, "").split(",");
    if (transformStyle[0]) {
        canvasStartPosition.x = parseFloat(transformStyle[0]);
        canvasStartPosition.y = parseFloat(transformStyle[1]);
    }

}

function onMove(e) {
    let offsetX = e.pageX - mousePosition.x;
    let offsetY = e.pageY - mousePosition.y;

    // Translate canvas to new position
    offsetX = offsetX / zoomFactor;
    offsetY = offsetY / zoomFactor;
    let x = canvasStartPosition.x + offsetX;
    let y = canvasStartPosition.y + offsetY;

    moveCanvas(x, y);
}

function onEnter(e) {
    if (leftclick) {
        onMouseUp(e);
        onMouseDown(e);
    } 
}

function onLeave(e) {

    if (leftclick) {

    }
}

function onWheel(e) {
    //e.preventDefault();

    if (e.deltaY < 0 && zoomFactor < maxZoom - 1) {
        zoomFactor += 2;
        resize();
    } else if (e.deltaY < 0 && zoomFactor == maxZoom - 1) {
        zoomFactor++;
        resize();
    }
    if (e.deltaY > 0 && zoomFactor > 2) {
        zoomFactor -= 2;
        resize();
    } else if (e.deltaY > 0 && zoomFactor == 2) {
        zoomFactor--;
        resize();
    }

}

function init() {
    signIn();
    canvasStartPosition.x = CONTAINERWIDTH / 4;
    canvasStartPosition.y = CONTAINERHEIGHT / 4;
    currentCanvasPosition.x = canvasStartPosition.x;
    currentCanvasPosition.y = canvasStartPosition.y;
    moveCanvas(CONTAINERWIDTH / 4, CONTAINERHEIGHT / 4);
    zoomFactor = 4;
    resize();
    listenToDb();
}

init();