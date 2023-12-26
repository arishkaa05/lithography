<template>
	<h2>{{ message }}</h2>
	
	<div id="wrapper">
		<canvas id="backCanvas"></canvas>
		<canvas @mousedown="startPainting" @mouseup="finishedPainting" @mousemove="drawing" id="canvas1"></canvas>
		<canvas @mouseup="finishedPaintingRect" @mouseout="finishedPaintingRect" @mousemove="drawingRect" id="canvas2"></canvas>
	</div>
	<div class="color-picker">
		<div v-for="color in colors" class="color-box" :style="{ backgroundColor: color }" @click="changeColor(color)"></div>
	</div>
	<div class="tool-picker">
		
		<a class="tool-button" @click.prevent="toggleRectangleMode">{{rectangleModeText}}</a>
		<a class="tool-button" @click.prevent="toggleEraserMode">{{eraserModeText}}</a>
		<a class="tool-button" @click.prevent="clearCanvas">🗑️</a>
		<a class="tool-button" @click.prevent="writeFile">📥</a>
		<a class="tool-button" @click.prevent="loadFile">📤</a>
	</div>
	<!-- <a class="test-user-button" @click.prevent="testUser">LONG BUTTON</a> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const message = ref("Чертеж схемы");
const painting = ref(false);
const wrapper = ref(null);
const backCanvas = ref(null);
const canvas1 = ref(null);
const canvas2 = ref(null);
const offsetX = ref(0);
const offsetY = ref(0);
const scaleX = ref(1);
const scaleY = ref(1);
const ctxBack = ref(null);
const ctx1 = ref(null);
const ctx2 = ref(null);
const colors = ref(["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]);

const isRasterMode = ref(false);

const rectangleMode = ref(false);
const rectangleModeText = ref('🖌️');

const eraserMode = ref(false);
const eraserModeText = ref('🔳');
const lastColor = ref("#000000");

const rectStartX=ref(0);
const rectStartY=ref(0);

enum drawModeShape{
	brush = "BRUSH",
	square = "SQUARE",
	line = "LINE"
}

const changeColor = (color) => {
	if(isRasterMode.value){
		if(eraserMode.value==false){
			ctx1.value.strokeStyle = color;
			ctx1.value.fillStyle = color;
			ctx2.value.strokeStyle = color;
			ctx2.value.fillStyle = color;
		}
	}
	lastColor.value = color;
};

const toggleRectangleMode = () => {
	if(isRasterMode.value){
		rectangleMode.value = !rectangleMode.value;
		rectangleModeText.value = rectangleMode.value == true?'🟥':'🖌️';
	}
};

const toggleEraserMode = () => {
	if(isRasterMode.value){
		eraserModeText.value = eraserMode.value == true?'🔲':'🔳';
		ctx1.value.strokeStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx1.value.fillStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx2.value.strokeStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx2.value.fillStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx1.value.globalCompositeOperation = eraserMode.value == true?"destination-out":"source-over";
		eraserMode.value = !eraserMode.value;
	}
};

const clearCanvas = () => {
	if(isRasterMode.value){
		ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
		ctx2.value.clearRect(0, 0, canvas2.value.width, canvas2.value.height);
	}
};

const startPaintingRect = (e) => {
	if(isRasterMode.value){
		if(rectangleMode.value==true){
			rectStartX.value = (e.clientX - offsetX.value)/scaleX.value;
			rectStartY.value = (e.clientY - offsetY.value)/scaleY.value;
			ctx2.value.clearRect(0,0,canvas2.value.width,canvas2.value.height);
			canvas2.value.style.left = "0%";
			painting.value = true;
		}
	}
}

const startPainting = (e) => {
	if(isRasterMode.value){
		startPaintingRect(e);
		if(rectangleMode.value==false){
			painting.value = true;
			drawing(e);
		}
	}
};

const finishedPaintingRect = (e) => {
	if(isRasterMode.value){
		if(rectangleMode.value==true){
			const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
			const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
			painting.value = false;
			canvas2.value.style.left = "-200%";
			drawRect(newMouseX,newMouseY,ctx1);
		}
	}
}

const finishedPainting = (e) => {
	if(isRasterMode.value){
		const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
		const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
		if(rectangleMode.value==true){
			painting.value = false;
			canvas2.value.style.left = "-200%";
			drawRect(newMouseX,newMouseY,ctx1);
		}
		else{
			painting.value = false;
			ctx1.value.beginPath();
		}
	}
};

const drawRect = (toX,toY,context) => {
	if(isRasterMode.value){
		ctxBack.value.lineWidth = 2;
		ctx1.value.lineWidth = 5;
		ctx1.value.lineCap = "round";
		ctx2.value.lineWidth = 5;
		ctx2.value.lineCap = "round";
		context.value.beginPath();
		context.value.fillRect(rectStartX.value,rectStartY.value,toX-rectStartX.value,toY-rectStartY.value);
		context.value.stroke();
	}
}

const drawLine = (toX,toY,context) => {
	ctxBack.value.lineWidth = 2;
	ctx1.value.lineWidth = 5;
	ctx1.value.lineCap = "round";
	ctx2.value.lineWidth = 5;
	ctx2.value.lineCap = "round";
	context.value.lineTo(toX, toY);
	context.value.stroke();

	context.value.beginPath();
	context.value.moveTo(toX, toY);
}

const drawingRect = (e) => {
	if(isRasterMode.value){
		if (!painting.value) return;
		if(rectangleMode.value==true){
		const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
		const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
			ctx2.value.clearRect(0,0,canvas2.value.width,canvas2.value.height);
			drawRect(newMouseX,newMouseY,ctx2);
		}
	}
}

const drawing = (e) => {
	if(isRasterMode.value){
		if (!painting.value) return;
		const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
		const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
		if(rectangleMode.value==false){
			drawLine(newMouseX,newMouseY,ctx1);
		}
	}
};

// const testUser = (e) => {

// }

const tmpFile = ref("");
const writeFile = (e) => {
	var canvasContents = canvas1.value.toDataURL(); // a data URL of the current canvas image
	var data = { image: canvasContents, date: Date.now() };
	tmpFile.value = JSON.stringify(data);
}

const loadFile = (e) => {
	var data = JSON.parse(tmpFile.value);
	var image = new Image();
	image.onload = function () {
		ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
		ctx1.value.drawImage(image, 0, 0); // draw the new image to the screen
	}
	image.src = data.image; // data.image contains the data URL
}



onMounted(() => {
	// Init canvases
	wrapper.value = document.getElementById("wrapper");
	offsetX.value += wrapper.value.offsetLeft;
	offsetY.value += wrapper.value.offsetTop;

	backCanvas.value = document.getElementById("backCanvas");
	ctxBack.value = backCanvas.value.getContext("2d");

	canvas1.value = document.getElementById("canvas1");
	offsetX.value += canvas1.value.offsetLeft;
	offsetY.value += canvas1.value.offsetTop;
	scaleX.value = canvas1.value.getBoundingClientRect().width/500;
	scaleY.value = canvas1.value.getBoundingClientRect().height/500;
	ctx1.value = canvas1.value.getContext("2d");

	canvas2.value = document.getElementById("canvas2");
	ctx2.value = canvas2.value.getContext("2d");

	// Set default stroke color
	ctx1.value.strokeStyle = colors.value[0];
	ctx1.value.fillStyle = colors.value[0];
	ctx2.value.strokeStyle = colors.value[0];
	ctx2.value.fillStyle = colors.value[0];

	// Resize canvases
	canvas2.value.style.left = "-200%";

	backCanvas.value.width = 500*scaleX.value/scaleY.value;
	canvas1.value.width = 500*scaleX.value/scaleY.value;
	canvas2.value.width = 500*scaleX.value/scaleY.value;
	backCanvas.value.height = 500;
	canvas1.value.height = 500;
	canvas2.value.height = 500;

	scaleX.value = canvas1.value.getBoundingClientRect().width/canvas1.value.width;

	// Draw grid
	const step = 20;
	const n = Math.floor(backCanvas.value.width/step)+1;
	for (let i = 0; i < n; i++) {
		ctxBack.value.setLineDash([i%5!=0?step/10:step/2]);
		ctxBack.value.strokeStyle = i%5!=0?"#aaaaaa":"#888888";
		drawLine(step*i,0-step/4,ctxBack);
		drawLine(step*i,500,ctxBack);
		ctxBack.value.beginPath();
	}
	
	const m = Math.floor(backCanvas.value.height/step)+1;
	for (let i = 0; i < m; i++) {
		ctxBack.value.setLineDash([i%5!=0?step/10:step/2]);
		ctxBack.value.strokeStyle = i%5!=0?"#aaaaaa":"#888888";
		drawLine(0-step/4,step*i,ctxBack);
		drawLine(backCanvas.value.width,step*i,ctxBack);
		ctxBack.value.beginPath();
	}
});
</script>

<style>
* {
	box-sizing: border-box;
}

body {
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	margin: 0;
	background-color: #f0f0f0;
}

#app {
	width: 90%;
	max-width: 1200px;
	background-color: #fff;
	padding: 2rem;
	border-radius: 1rem;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
	text-align: center;
	margin-bottom: 1rem;
}

canvas {
	cursor: crosshair;
}

.color-box {
	display: inline-block;
	width: 20px;
	height: 20px;
	margin: 0 5px;
	cursor: pointer;
	border-radius: 50%;
}

/* tool bar */
.tool-picker {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}

/* tool button */
.tool-button {
	display: block;
	margin-left: 3px;
	margin-right: 3px;
	background-color: #fff;
	border-width: 2px;
	border-color: #333;
	border-radius: 5px;
	color: #fff;
	text-align: center;
	cursor: pointer;
	text-decoration: none;
	font-weight: bold;
	font-size:24px;
}

.tool-button:hover {
	background-color: #eee;
}

.color-picker {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}
/* clear button */
.test-user-button {
	display: block;
	margin: 1rem auto;
	padding: 0.5rem 1rem;
	background-color: #333;
	color: #fff;
	text-align: center;
	border-radius: 5px;
	cursor: pointer;
	text-decoration: none;
	font-weight: bold;
}

.test-user-button:hover {
	background-color: #444;
}

#wrapper{
	position:relative;
	width:100%;
	height:400px;
}
#backCanvas{
	position:absolute; top:0px; left:0px;
	border:1px solid black;
	background-color: #fff;
	width:100%;
	height:100%;
}
#canvas1{
	position:absolute; top:0px; left:0px;
	border:1px solid black;
	width:100%;
	height:100%;
}
#canvas2{
	position:absolute; top:0px; left:0px;
	/* border:1px solid red; */
	width:100%;
	height:100%;
}
</style>