const mousePosition = { x: 0.0, y: 0.0};
const canvasStartPosition = {x: 0.0 , y: 0.0};
const currentCanvasPosition = {x: 0.0 , y: 0.0};
let PLACEWIDTH = 400;
let PLACEHEIGHT = 400;
let CONTAINERWIDTH = PLACEWIDTH * 2;
let CONTAINERHEIGHT = PLACEHEIGHT * 2;

const availableSpace = {x: CONTAINERWIDTH - PLACEWIDTH - 1, y: CONTAINERHEIGHT - PLACEHEIGHT - 1};
const drag = document.getElementById('drag');
const container = document.getElementById('zoom');
const zoom = document.getElementById('zoom');
const placeBtn = document.getElementById('place-btn');
const colorpicker = document.getElementById('color-picker');
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
let zoomFactor = 1;
let maxZoom = 40;


const crosshair2 = document.getElementById('crosshair2');
const coordinates = document.getElementById('coordinates');


let containerRect = container.getBoundingClientRect();




// init
// read all x, y positions. if it doesnt exist, it means the pixel is white.
// listener auf 


function placeTile(e) {
    let targetX =  PLACEWIDTH - Math.round(canvasStartPosition.x) - 1;
    let targetY = PLACEHEIGHT - Math.round(canvasStartPosition.y) - 1;
    ctx.fillStyle = selectedColor.style.backgroundColor;
    console.log("filling: " + targetX + " " + targetY);

    moveCrosshair();

    console.log(containerRect.top, containerRect.right, containerRect.bottom, containerRect.left);
    console.log("canvas position: " + canvasStartPosition.x + " " + canvasStartPosition.y);
    console.log("filling: " + targetX + " " + targetY);
    console.log("crosshair position top: " + crosshair2.style.top + " left: " + crosshair2.style.left);

    writeToDb(targetX + " " + targetY, + new Date(), 1, ctx.fillStyle);
    ctx.fillRect(targetX, targetY, 1, 1);
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
    console.log("move crosshair");

    let targetX =  PLACEWIDTH - Math.round(currentCanvasPosition.x) - 1;
    let targetY = PLACEHEIGHT - Math.round(currentCanvasPosition.y) - 1;
    // Insert current coordinates into UI
    coordinates.textContent = "(" + targetX + " ," + targetY + ") " + zoomFactor / 8 + "x";

    let top = containerRect.top + (currentCanvasPosition.y + targetY)*zoomFactor -1;
    let left = containerRect.left + (currentCanvasPosition.x + targetX)*zoomFactor -1;

    crosshair2.style.transform = "translate(" + left + "px, " + top + "px)";
}

function resize() {
    console.log("resizing: " + zoomFactor);
    console.log("transform zoom: " + zoom.style.transform);
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
    console.log("Current position: " + canvasStartPosition.x + " ," + canvasStartPosition.y);
    console.log("Move to: " + x + " ," + y);

    drag.style.transform = "translate(" + x + "px, " + y + "px)";
    currentCanvasPosition.x = x;
    currentCanvasPosition.y = y;
    // crosshair2.style.transform = "translate(" + x*zoomFactor + "px, " + y*zoomFactor + "px)";
    console.log("translate(" + x + "px, " + y + "px)");
    moveCrosshair();
}

function onMouseDown(e) {
    e.preventDefault();
    console.log("mouse down");
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    
    // Add move listener
    game.addEventListener("mousemove", onMove, false);
    leftclick = true;
}

function onMouseUp(e) {
    console.log("mouse up");
    console.log("canvas position up1: " + canvasStartPosition.x + ", " + canvasStartPosition.y);
    // Remove move listener
    game.removeEventListener("mousemove", onMove, false);
    leftclick = false;

    // Read new canvas position
    const transformStyle = drag.style.transform.replace(/[^\d.,]/g, "").split(",");
    console.log(transformStyle[0] + " " + transformStyle[1]);
    if (transformStyle[0]) {
        canvasStartPosition.x = parseFloat(transformStyle[0]);
        canvasStartPosition.y = parseFloat(transformStyle[1]);
        console.log("canvas position up: " + canvasStartPosition.x + ", " + canvasStartPosition.y);
    }

}

function onMove(e) {
    console.log("onMove start");
    let offsetX = e.pageX - mousePosition.x;
    let offsetY = e.pageY - mousePosition.y;
    console.log("onMove offsetX: " + offsetX + ", offsetY: " + offsetY);

    // Translate canvas to new position
    offsetX = offsetX / zoomFactor;
    offsetY = offsetY / zoomFactor;
    let x = canvasStartPosition.x + offsetX;
    let y = canvasStartPosition.y + offsetY;

    moveCanvas(x, y);
}

function onEnter(e) {
    console.log("enter");
    if (leftclick) {
        onMouseUp(e);
        onMouseDown(e);
    } 
}

function onLeave(e) {

    console.log("leave");
    if (leftclick) {

    }
}

function onWheel(e) {
    //e.preventDefault();

    console.log("scrolling: " + e.deltaY);
    if (e.deltaY < 0 && zoomFactor < maxZoom) {
        zoomFactor++;
        resize();
    }
    if (e.deltaY > 0 && zoomFactor > 1) {
        zoomFactor--;
        resize();
    }

}

function printPosition() {
    
    var rectC = crosshair2.getBoundingClientRect();
    console.log("crosshair2 getBoundingClientRect: top = " + rectC.top + ", left = " + rectC.left);

    var rect = canvas.getBoundingClientRect();
    console.log("canvas getBoundingClientRect: top = " + rect.top + ", left = " + rect.left);

    var rect3 = ctx.getBoundingClientRect();
    console.log("ctx getBoundingClientRect: top = " + rect3.top + ", left = " + rect3.left);
}


// setInterval(printPosition, 1000);
resize();

// ctx.strokeRect(350, 350, 50, 50);