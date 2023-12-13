<template>
	<h2>{{ message }}</h2>
	
	<div id="wrapper">
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
	</div>
	<!-- <a class="clear-button">LONG BUTTON</a> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const message = ref("Drawing App");
const painting = ref(false);
const wrapper = ref(null);
const canvas1 = ref(null);
const canvas2 = ref(null);
const offsetX = ref(0);
const offsetY = ref(0);
const scaleX = ref(1);
const scaleY = ref(1);
const ctx1 = ref(null);
const ctx2 = ref(null);
const colors = ref(["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]);
const changeColor = (color) => {
	if(eraserMode.value==false){
		ctx1.value.strokeStyle = color;
		ctx1.value.fillStyle = color;
		ctx2.value.strokeStyle = color;
		ctx2.value.fillStyle = color;
	}
	lastColor.value = color;
};

const rectangleMode = ref(false);
const rectangleModeText = ref('🖌️');
const toggleRectangleMode = () => {
	rectangleMode.value = !rectangleMode.value;
	rectangleModeText.value = rectangleMode.value == true?'🟥':'🖌️';
};

const eraserMode = ref(false);
const eraserModeText = ref('🔳');
const lastColor = ref("#000000");
const toggleEraserMode = () => {
	eraserMode.value = !eraserMode.value;
	eraserModeText.value = eraserMode.value == true?'🔲':'🔳';
	ctx1.value.strokeStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
	ctx1.value.fillStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
	ctx2.value.strokeStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
	ctx2.value.fillStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
	ctx1.value.globalCompositeOperation = eraserMode.value == true?"destination-out":"source-over";
};

const clearCanvas = () => {
	ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
	ctx2.value.clearRect(0, 0, canvas2.value.width, canvas2.value.height);
};

const rectStartX=ref(0);
const rectStartY=ref(0);

const startPaintingRect = (e) => {
	if(rectangleMode.value==true){
		rectStartX.value = (e.clientX - offsetX.value)/scaleX.value;
		rectStartY.value = (e.clientY - offsetY.value)/scaleY.value;
		ctx2.value.clearRect(0,0,canvas2.value.width,canvas2.value.height);
		canvas2.value.style.left = "0%";
		painting.value = true;
	}
}

const startPainting = (e) => {
	startPaintingRect(e);
	if(rectangleMode.value==false){
		painting.value = true;
		drawing(e);
	}
};
const finishedPaintingRect = (e) => {
	if(rectangleMode.value==true){
		const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
		const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
		painting.value = false;
		canvas2.value.style.left = "-200%";
		drawRect(newMouseX,newMouseY,ctx1);
	}
}

const finishedPainting = (e) => {
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
};

const drawRect = (toX,toY,context) => {
	context.value.beginPath();
	context.value.fillRect(rectStartX.value,rectStartY.value,toX-rectStartX.value,toY-rectStartY.value);
	context.value.stroke();
}
const drawLine = (toX,toY,context) => {
	context.value.lineTo(toX, toY);
	context.value.stroke();

	context.value.beginPath();
	context.value.moveTo(toX, toY);
}

const drawingRect = (e) => {
	if (!painting.value) return;
	if(rectangleMode.value==true){
	ctx1.value.lineWidth = 5;
	ctx1.value.lineCap = "round";
	ctx2.value.lineWidth = 5;
	ctx2.value.lineCap = "round";
	const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
	const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
		ctx2.value.clearRect(0,0,canvas2.value.width,canvas2.value.height);
		drawRect(newMouseX,newMouseY,ctx2);
	}
}

const drawing = (e) => {
	if (!painting.value) return;
	ctx1.value.lineWidth = 5;
	ctx1.value.lineCap = "round";
	ctx2.value.lineWidth = 5;
	ctx2.value.lineCap = "round";
	const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
	const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
	if(rectangleMode.value==false){
		drawLine(newMouseX,newMouseY,ctx1);
	}
};

onMounted(() => {
	wrapper.value = document.getElementById("wrapper");
	offsetX.value += wrapper.value.offsetLeft;
	offsetY.value += wrapper.value.offsetTop;
	canvas1.value = document.getElementById("canvas1");
	offsetX.value += canvas1.value.offsetLeft;
	offsetY.value += canvas1.value.offsetTop;
	scaleX.value = canvas1.value.getBoundingClientRect().width/500;
	scaleY.value = canvas1.value.getBoundingClientRect().height/500;
	ctx1.value = canvas1.value.getContext("2d");
	canvas2.value = document.getElementById("canvas2");
	ctx2.value = canvas2.value.getContext("2d");
	ctx1.value.translate(0.5,0.5);
	ctx2.value.translate(0.5,0.5);

	// Set default stroke color
	ctx1.value.strokeStyle = colors.value[0];
	ctx1.value.fillStyle = colors.value[0];
	ctx2.value.strokeStyle = colors.value[0];
	ctx2.value.fillStyle = colors.value[0];

	canvas2.value.style.left = "-200%";
	canvas1.value.width = 500*scaleX.value/scaleY.value;
	canvas2.value.width = 500*scaleX.value/scaleY.value;
	canvas1.value.height = 500;
	canvas2.value.height = 500;
	scaleX.value = canvas1.value.getBoundingClientRect().width/canvas1.value.width;
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
	padding: 3px;
	background-color: #fff;
	border-width: 2px;
	border-color: #333;
	border-radius: 5px;
	color: #fff;
	text-align: center;
	cursor: pointer;
	text-decoration: none;
	font-weight: bold;
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
.clear-button {
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

.clear-button:hover {
	background-color: #444;
}

#wrapper{
	position:relative;
	width:100%;
	height:400px;
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