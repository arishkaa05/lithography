<template>
	<!-- <h2>{{ debugvar }}</h2> -->
	<div id="wrapper">
		<canvas id="backCanvas"></canvas>
		<canvas @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseout="onMouseOut" @mousemove="onMouseMove" @click="onClick" id="canvas1"></canvas>
		<canvas @mouseup="onMouseUp" @mouseout="onMouseUp" @mousemove="onMouseMove" id="canvas2"></canvas>
	</div>
	<div class="toolbar">
		<div class="color-picker">
			<div v-for="color in colors" class="color-box" :style="{ backgroundColor: color }" @click="selectColor(color)"></div>
		</div>
		<div class="tool-picker">
			<a class="tool-button" @click.prevent="toggleRectangleMode">{{rectangleModeText}}</a>
			<a class="tool-button" @click.prevent="toggleEraserMode">{{eraserModeText}}</a>
			<a class="tool-button" @click.prevent="clearCanvas">🗑️</a>
			<a class="tool-button" @click.prevent="writeFile">📥</a>
			<a class="tool-button" @click.prevent="loadFile">📤</a>
		</div>
		<div class="tool-picker">
			<a class="tool-button" @click.prevent="loadFile">В самый низ</a>
			<a class="tool-button" @click.prevent="loadFile">Вниз</a>
			<a class="tool-button" @click.prevent="loadFile">Вверх</a>
			<a class="tool-button" @click.prevent="moveToTop">В самый верх</a>
		</div>
	</div>
	<!-- <a class="test-user-button" @click.prevent="testUser">LONG BUTTON</a> -->
</template>

<script setup lang="ts">
import { getDefaultLibFileName } from 'typescript';
import { ref, onMounted } from 'vue';
const message = ref("Чертеж схемы");
const mouseDown = ref(false);
const painting = ref(false);
const wrapper = ref(null);
const backCanvas = ref(null);
const canvas1 = ref(null);
const canvas2 = ref(null);
const offsetX = ref(0);
const offsetY = ref(0);
const scaleX = ref(1);
const scaleY = ref(1);
const pixelsX = ref(500);
const pixelsY = ref(500);
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

const debugvar = ref(0);

class Point{
	x = 0;
	y = 0;
	constructor(x_,y_){
		this.x=x_;
		this.y=y_;
	}
}

class VectRect{
	point1 = new Point(0,0);
	point2 = new Point(0,0);
	color = "#000000";
	zOrder = 0;
	isSelected = false;
	selectedCornerID = -1;
	setPoint1(point){
		this.point1 = point;
	}
	setPoint2(point){
		this.point2 = point;
	}
	setColor(color){
		this.color = color;
	}
	setZOrder(zOrder){
		this.zOrder = zOrder;
	}
	constructor(point1:Point,point2:Point,color,zOrder){
		this.point1 = point1;
		this.point2 = point2;
		this.color = color;
		this.zOrder = zOrder;
	}
	isPointInside(point:Point){
		var width = Math.abs(this.point1.x-this.point2.x);
		var height = Math.abs(this.point1.y-this.point2.y);
		var center = new Point((this.point1.x+this.point2.x)/2,(this.point1.y+this.point2.y)/2);
		return Math.abs(point.x-center.x)<=width/2 && Math.abs(point.y-center.y)<=height/2;
	}
	drawCorners(){
		var center = new Point((this.point1.x+this.point2.x)/2,(this.point1.y+this.point2.y)/2);
		drawPoint(new Point(this.point1.x,this.point1.y), this.selectedCornerID == 0 ? "#ff0000" : "#000000");
		drawPoint(new Point(this.point1.x,this.point2.y), this.selectedCornerID == 2 ? "#ff0000" : "#000000");
		drawPoint(new Point(this.point2.x,this.point1.y), this.selectedCornerID == 1 ? "#ff0000" : "#000000");
		drawPoint(new Point(this.point2.x,this.point2.y), this.selectedCornerID == 3 ? "#ff0000" : "#000000");
		drawPoint(center,"#000000");
	}
	move(point){
		var width = Math.abs(this.point1.x-this.point2.x);
		var height = Math.abs(this.point1.y-this.point2.y);
		this.point1.x = point.x-width/2;
		this.point1.y = point.y-height/2;
		this.point2.x = point.x+width/2;
		this.point2.y = point.y+height/2;
	}
	moveCorner(point:Point){
		this.point1.x = (this.selectedCornerID % 2 == 0) ? point.x : this.point1.x;
		this.point1.y = (Math.floor(this.selectedCornerID / 2) == 0) ? point.y : this.point1.y;
		this.point2.x = (this.selectedCornerID % 2 == 1) ? point.x : this.point2.x;
		this.point2.y = (Math.floor(this.selectedCornerID / 2) == 1) ? point.y : this.point2.y;
	}
	checkCorner(point:Point){
		var isCornerX = -1;
		var isCornerY = -1;
		var r= 10;
		var lowerBound = Math.min(this.point1.y,this.point2.y)-r/2;
		var upperBound = Math.max(this.point1.y,this.point2.y)+r/2;
		var leftBound = Math.min(this.point1.x,this.point2.x)-r/2;
		var rightBound = Math.max(this.point1.x,this.point2.x)+r/2;
		if(point.x > leftBound && point.x < rightBound && point.y > lowerBound && point.y < upperBound){
			if(Math.abs(point.x-this.point1.x)<r)isCornerX =0;
			if(Math.abs(point.x-this.point2.x)<r)isCornerX =1;
			if(Math.abs(point.y-this.point1.y)<r)isCornerY =0;
			if(Math.abs(point.y-this.point2.y)<r)isCornerY =2;
		}
		this.selectedCornerID = isCornerX+isCornerY;
		return this.selectedCornerID;
	}
}

const EMPTY_VECT_RECT = new VectRect(new Point(-500,-500),new Point(-500,-500),"#ffffff",0);
var selectedVectRect = EMPTY_VECT_RECT;
var selectedVectRectID = 0;

class VectRects{
	public vectRects;
	constructor(){
		this.vectRects = [];
	}
	sort(){
		this.vectRects.sort(function(a:any,b:any){return a.zOrder - b.zOrder});
	}
	newVectRect(point1,point2,color,zOrder){
		let vr = new VectRect(point1,point2,color,zOrder);
		this.vectRects.push(vr);
		this.sort();
	}
	redrawVectRects(){
		clearCanvas();
		for(var i = 0; i < this.vectRects.length; i++){
			drawVectRect(this.vectRects.at(i));
		}
	}
	selectVectRect(i:number){
		if(this.vectRects.length>i && i >= 0){
			this.vectRects.at(selectedVectRectID).isSelected = false;
			selectedVectRectID = i;
			debugvar.value=selectedVectRectID;
			this.vectRects.at(selectedVectRectID).isSelected = true;
			selectedVectRect = this.vectRects.at(selectedVectRectID);
		}
	}
	
	updateZOrder(){
		for(var i=0;i<this.vectRects.length;i++){
			this.vectRects.at(i).zOrder=i;
		}
	}
}

var vrLayer = new VectRects();

const drawVectRect = (vectRect:VectRect) => {
	changeColor(vectRect.color);
	ctxBack.value.lineWidth = 2;
	ctx1.value.lineWidth = 5;
	ctx1.value.lineCap = "round";
	ctx2.value.lineWidth = 5;
	ctx2.value.lineCap = "round";
	var width = vectRect.point2.x-vectRect.point1.x;
	var height = vectRect.point2.y-vectRect.point1.y;
	ctx1.value.beginPath();
	ctx1.value.fillRect(vectRect.point1.x,vectRect.point1.y,width,height);
	ctx1.value.stroke();
	if(vectRect.isSelected==true)vectRect.drawCorners();
	
}

enum drawModeShape{
	brush = "BRUSH",
	square = "SQUARE",
	line = "LINE"
}

const toggleRectangleMode = () => {
	if(isRasterMode.value){
		rectangleMode.value = !rectangleMode.value;
		rectangleModeText.value = rectangleMode.value == true?'🟥':'🖌️';
	}
};

const toggleEraserMode = () => {
	if(isRasterMode.value){
		eraserMode.value = !eraserMode.value;
		eraserModeText.value = eraserMode.value == true?'🔲':'🔳';
		ctx1.value.strokeStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx1.value.fillStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx2.value.strokeStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx2.value.fillStyle = eraserMode.value == true?"#FFFFFF":lastColor.value;
		ctx1.value.globalCompositeOperation = eraserMode.value == true?"destination-out":"source-over";
	}
};

const changeColor = (color) => {
	if(isRasterMode.value){
		if(eraserMode.value==false){
			ctx1.value.strokeStyle = color;
			ctx1.value.fillStyle = color;
			ctx2.value.strokeStyle = color;
			ctx2.value.fillStyle = color;
		}
	}
	else{
		ctx1.value.strokeStyle = color;
		ctx1.value.fillStyle = color;
	}
	lastColor.value = color;
};

const selectColor = (color) => {
	if(isRasterMode.value){
		changeColor(color);
	}
	else{
		ctx1.value.strokeStyle = color;
		ctx1.value.fillStyle = color;
		selectedVectRect.color = color;
		vrLayer.vectRects.at(selectedVectRectID).color=color;
		vrLayer.redrawVectRects();
	}
	lastColor.value = color;
}

const clearCanvas = () => {
	if(isRasterMode.value){
		ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
		ctx2.value.clearRect(0, 0, canvas2.value.width, canvas2.value.height);
	}
	else{
		ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
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

const drawPoint = (point,color) => {
	ctx1.value.fillStyle = color;
	ctx1.value.beginPath();
	ctx1.value.arc(point.x, point.y, 4, 0, 2 * Math.PI);
	ctx1.value.fill();
}

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

const rasterModePaintStart = (e) =>{
	if(rectangleMode.value==true){
		rectStartX.value = (e.clientX - offsetX.value)/scaleX.value;
		rectStartY.value = (e.clientY - offsetY.value)/scaleY.value;
		ctx2.value.clearRect(0,0,canvas2.value.width,canvas2.value.height);
		canvas2.value.style.left = "0%";
		painting.value = true;
	}
	else{
		painting.value = true;
		rasterModePainting(e);
	}
}

const rasterModePaintFinish = (e) => {
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

const rasterModePainting = (e) => {
	if (!painting.value) return;
	const newMouseX = (e.clientX - offsetX.value)/scaleX.value;
	const newMouseY = (e.clientY - offsetY.value)/scaleY.value;
	if(rectangleMode.value==true){
		ctx2.value.clearRect(0,0,canvas2.value.width,canvas2.value.height);
		drawRect(newMouseX,newMouseY,ctx2);
	}
	else{
		drawLine(newMouseX,newMouseY,ctx1);
	}
}

const onMouseDown = (e) => {
	mouseDown.value = true;
	if(isRasterMode.value){
		rasterModePaintStart(e);
	}
	else{
		var mouseLocation = 
			new Point(
				(e.clientX - offsetX.value)/scaleX.value,
				(e.clientY - offsetY.value)/scaleY.value
				);
		for(var i = vrLayer.vectRects.length-1; i >= 0; i--){
			if(vrLayer.vectRects.at(i).checkCorner(mouseLocation)>=0){
				if(vrLayer.vectRects.at(i)!= selectedVectRect){
					vrLayer.selectVectRect(i);
				}
				vrLayer.redrawVectRects();
				break;
			}
			if(vrLayer.vectRects.at(i).isPointInside(mouseLocation)==true)
			{
				if(vrLayer.vectRects.at(i)!= selectedVectRect){
					vrLayer.selectVectRect(i);
					vrLayer.redrawVectRects();
				}
				break;
			}
		}
	}
};

const onMouseUp = (e) => {
	mouseDown.value = false;
	if(isRasterMode.value){
		rasterModePaintFinish(e);
	}
	else{
		selectedVectRect.selectedCornerID=-1;
		selectedVectRect = EMPTY_VECT_RECT;
		vrLayer.redrawVectRects();
	}
}

const onMouseMove = (e) => {
	if(isRasterMode.value){
		rasterModePainting(e);
	}
	else{
		var mouseLocation = 
			new Point(
				(e.clientX - offsetX.value)/scaleX.value,
				(e.clientY - offsetY.value)/scaleY.value
				);
		if(mouseDown.value==true){
			if(selectedVectRect!=EMPTY_VECT_RECT){
				if(selectedVectRect.selectedCornerID>=0){
					selectedVectRect.moveCorner(mouseLocation);
				}
				else{
					selectedVectRect.move(mouseLocation);
				}
			}
			vrLayer.redrawVectRects();
		}
	}
};

const onMouseOut = (e) => {
	mouseDown.value =false;
	painting.value =false;
	selectedVectRect.selectedCornerID=-1;
	selectedVectRect = EMPTY_VECT_RECT;
	vrLayer.redrawVectRects();
}

const moveArrayElement = (from, to)=> {
	let numberOfDeletedElm = 1;
	const elm = vrLayer.vectRects.splice(from, numberOfDeletedElm)[0];
	numberOfDeletedElm = 0;
	vrLayer.vectRects.splice(to, numberOfDeletedElm, elm);
	
	vrLayer.updateZOrder();
	selectedVectRectID = vrLayer.vectRects.length-1;
	selectedVectRect = vrLayer.vectRects.at(vrLayer.vectRects.length-1);
}


const moveToTop = () => {
	if(vrLayer.vectRects.length > selectedVectRectID && selectedVectRectID>=0)
	{
		selectedVectRect = vrLayer.vectRects.at(selectedVectRectID);
		moveArrayElement(selectedVectRectID,vrLayer.vectRects.length-1);
		vrLayer.redrawVectRects();
	}
}

const onClick = (e) => {
	if(!isRasterMode.value){
	}
}



onMounted(() => {
	pixelsX.value = 1400;
	pixelsY.value = 600;

	// Init canvases
	wrapper.value = document.getElementById("wrapper");
	offsetX.value += wrapper.value.offsetLeft;
	offsetY.value += wrapper.value.offsetTop;

	backCanvas.value = document.getElementById("backCanvas");
	ctxBack.value = backCanvas.value.getContext("2d");

	canvas1.value = document.getElementById("canvas1");
	offsetX.value += canvas1.value.offsetLeft;
	offsetY.value += canvas1.value.offsetTop;
	scaleX.value = canvas1.value.getBoundingClientRect().width/pixelsX.value;
	scaleY.value = canvas1.value.getBoundingClientRect().height/pixelsY.value;
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

	backCanvas.value.width = pixelsX.value*scaleX.value/scaleY.value;
	canvas1.value.width = pixelsX.value*scaleX.value/scaleY.value;
	canvas2.value.width = pixelsX.value*scaleX.value/scaleY.value;
	backCanvas.value.height = pixelsY.value;
	canvas1.value.height = pixelsY.value;
	canvas2.value.height = pixelsY.value;

	scaleX.value = canvas1.value.getBoundingClientRect().width/canvas1.value.width;

	// Draw grid
	const step = 20;
	const n = Math.floor(backCanvas.value.width/step)+1;
	for (let i = 0; i < n; i++) {
		ctxBack.value.setLineDash([i%5!=0?step/10:step/2]);
		ctxBack.value.strokeStyle = i%5!=0?"#aaaaaa":"#888888";
		drawLine(step*i,0-step/4,ctxBack);
		drawLine(step*i,pixelsX.value,ctxBack);
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

	vrLayer = new VectRects();

	vrLayer.newVectRect(new Point(520,220),new Point(600,300),"#ff00ff",0);
	vrLayer.newVectRect(new Point(560,240),new Point(660,340),"#ffff00",1);
	vrLayer.newVectRect(new Point(600,280),new Point(700,380),"#ff0000",2);
	vrLayer.newVectRect(new Point(640,420),new Point(740,480),"#00ffff",3);

	vrLayer.redrawVectRects();

	
	debugvar.value = -1;
});
</script>

<style>

body {
	display:flex;
	justify-content: center;
	width:100%;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	background-color: #f0f0f0;
}

#app {
	display:flex;
	justify-content: center;
	width:100%;
	background-color: #fff;
}

h2 {
	text-align: center;
	margin-bottom: 1rem;
}

canvas {
	cursor: crosshair;
}

.color-box {
	width: 20px;
	height: 20px;
	margin: 0 5px;
	cursor: pointer;
	border-radius: 50%;
}

/* tool bar */
.tool-picker {
	display: flex;
	margin-top: 1rem;
}

/* tool button */
.tool-button {
	padding: 0 10px;
	background-color: #fff;
	border-width: 2px;
	border-color: #333;
	border-radius: 5px;
	color: #333;
	text-align: center;
	cursor: pointer;
	text-decoration: none;
	font-weight:normal;
	font-size:18px;
}

.tool-button:hover {
	background-color: #eee;
}

.color-picker {
	display: flex;
	margin-top: 2rem;
}
/* clear button */
.test-user-button {
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


.toolbar {
	justify-content: center;
	display: flex;
	margin:20px;
	width:100%;
}

#wrapper{
	margin:20px;
	position:relative;
	width:1400px;
	height:600px;
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
	border:1px solid black;
	width:100%;
	height:100%;
}
</style>