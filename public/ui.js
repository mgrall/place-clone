const colorList = ['red', 'green', 'blue', 'gray', 'orange', 'pink', 'red',
    'green', 'blue', 'gray', 'orange', 'pink', 'red', 'green', 'blue', 'gray',
    'orange', 'pink', 'red', 'green'];

const selectBorder = "2px solid black";
const defaulBorder = "1px solid darkgrey";

const placeBtn2 = document.getElementById('place-btn');
const colorpicker2 = document.getElementById('color-picker');
const colors = document.getElementsByClassName("color");
const cancelBtn = document.getElementById("cancel-btn");

colorpicker2.addEventListener("submit", submit, false);
placeBtn2.addEventListener("click", openColorpicker, false);
cancelBtn.addEventListener("click", onCancel, false);


var selectedColor = colors[0];
colors[0].style.border = selectBorder;




for (let i = 0; i < colors.length; i++) {
    console.log(colors[i]);
    colors[i].addEventListener("click", selectColor, false);
    colors[i].style.backgroundColor = colorList[i];
}



function openColorpicker () {
    console.log("open");
    placeBtn2.style.display = "none";
    colorpicker2.style.display = "block";
}

function onCancel () {
    console.log("cancel");
    colorpicker2.style.display = "none";
    placeBtn2.style.display = "block";
}

function select () {
    alert("a");
}

function submit (event) {
    alert("submit");
    event.preventDefault();
}


function selectColor() {
    selectedColor.style.border = defaulBorder;
    this.style.border = selectBorder;
    selectedColor = this;
}