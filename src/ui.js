import { placeTimeStamp, COOLDOWN } from "./index.js";

// https://www.reddit.com/r/place/comments/txowoa/a_rplace_2022_final_palette_high_resolution_hex/
const colorList = ['#bd0038', '#ff4500', '#ffa800', '#ffd636', '#fff8b9', '#00a468', '#00cc77',
    '#7fed56', '#00756f', '#009eaa', '#00ccc0', '#2350a3', '#368fe9',
    '#93b3fe', '#811e9f', '#e5abff', '#de107f', '#ff98a9',
    '#6d482e', '#ffb470', '#000000', '#515352', '#d3d7da', '#ffffff'];

const selectBorder = "2px solid black";
const defaulBorder = "1px solid darkgrey";

const placeBtn2 = document.getElementById('place-btn');
const colorpicker2 = document.getElementById('color-picker');
const colors = document.getElementsByClassName("color");
const cancelBtn = document.getElementById("cancel-btn");

cancelBtn.addEventListener("click", onCancel, false);


var selectedColor = colors[0];
colors[0].style.border = selectBorder;


for (let i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", selectColor, false);
    colors[i].style.backgroundColor = colorList[i];
}


export function getSelectedColor () {
    return selectedColor.style.backgroundColor;
}

export function setTimer() {
    placeBtn2.innerHTML = timeStampToMinutes(placeTimeStamp + COOLDOWN - + new Date());
    placeBtn2.removeEventListener("click", openColorpicker, false);
    var x = setInterval(function() {
        var expTime = placeTimeStamp + COOLDOWN;
        var distance = expTime - + new Date();
        placeBtn2.innerHTML = timeStampToMinutes(distance);

        if (distance < 0) {
            clearInterval(x);
            initPlaceBtn();
        }
    }, 1000);
}

export function initPlaceBtn() {
    placeBtn2.addEventListener("click", openColorpicker, false);
    placeBtn2.innerHTML = "Place Tile";
}

function timeStampToMinutes(timeStamp) {
    return Math.floor((timeStamp % (1000 * 60 * 60)) / (1000 * 60)) + ":" + Math.floor((timeStamp % (1000 * 60)) / 1000);
}

function openColorpicker () {
    placeBtn2.style.display = "none";
    colorpicker2.style.display = "block";
}

export function onCancel () {
    colorpicker2.style.display = "none";
    placeBtn2.style.display = "block";
}

function selectColor() {
    selectedColor.style.border = defaulBorder;
    this.style.border = selectBorder;
    selectedColor = this;
}