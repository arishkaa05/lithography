<template>
	<div class="toolbar">
		<!-- <h2>{{ debugvar }}</h2> -->
		Цвет
		<div class="color-picker">
			<div v-for="color in colors" class="color-box" :style="{ backgroundColor: color }" @click="selectColor(color)"></div>
		</div>
		Схема
		<div class="tool-picker">
			<!-- <a class="tool-button" @click.prevent="toggleRectangleMode">{{rectangleModeText}}</a>
			<a class="tool-button" @click.prevent="toggleEraserMode">{{eraserModeText}}</a>
			<a class="tool-button" @click.prevent="clearCanvas">🗑️</a> -->
			<a class="tool-button" @click.prevent="writeFile">Сохранить</a>
			<a class="tool-button" @click.prevent="loadFile">Загрузить</a>
		</div>
		Прямоугольник
		<div class="tool-picker">
			<p>{{ point1CoordText }}</p>
			<p>{{ point2CoordText }}</p>
			<a class="tool-button" @click.prevent="onCreateVectRect">Создать</a>
			<a class="tool-button" @click.prevent="onDeleteVectRect">Удалить</a>
		</div>
		Слои
		<div class="tool-picker">
			<a class="tool-button" @click.prevent="moveToTop">В самый верх</a>
			<a class="tool-button" @click.prevent="moveUp">Вверх</a>
			<a class="tool-button" @click.prevent="moveDown">Вниз</a>
			<a class="tool-button" @click.prevent="moveToBottom">В самый низ</a>
		</div>
	</div>
	<div id="wrapper">
		<canvas id="backCanvas"></canvas>
		<canvas @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseout="onMouseOut" @mousemove="onMouseMove" @click="onClick" id="canvas1"></canvas>
		<canvas @mouseup="onMouseUp" @mouseout="onMouseUp" @mousemove="onMouseMove" id="canvas2"></canvas>
	</div>
	<!-- <a class="test-user-button" @click.prevent="testUser">LONG BUTTON</a> -->
</template>

<script setup lang="ts">
//#region Imports
import { JsxEmit, getDefaultLibFileName } from 'typescript';
import { ref, onMounted } from 'vue';
//#endregion

//#region Global variables
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

const point1CoordText = ref("x1: y1: ");
const point2CoordText = ref("x2: y2: ");

const isCreateMode=ref(false);

const debugvar = ref("a");
//#endregion

//#region 2D Vector Point

class Point{
	x = 0;
	y = 0;
	constructor(x_,y_){
		this.x=x_;
		this.y=y_;
	}
}
//#endregion

//#region 2D Vector Rectangle class

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
		if(selectedVectRectID>=0 && this.point1.x +  this.point2.x > -1000)
		{
			point1CoordText.value = "x1: "+ Math.min(this.point1.x,this.point2.x).toFixed(0) + " y1: " + Math.min(this.point1.y,this.point2.y).toFixed(0);
			point2CoordText.value = "x2: "+ Math.max(this.point1.x,this.point2.x).toFixed(0) + " y2: " + Math.max(this.point1.y,this.point2.y).toFixed(0);
		}
		var corners = [];
		corners.push(new Point(this.point1.x,this.point1.y));
		corners.push(new Point(this.point2.x,this.point1.y));
		corners.push(new Point(this.point1.x,this.point2.y));
		corners.push(new Point(this.point2.x,this.point2.y));
		corners.push(new Point((this.point1.x+this.point2.x)/2,(this.point1.y+this.point2.y)/2));
		for(var i=0;i<corners.length;i++){
			drawPoint(corners.at(i),(this.selectedCornerID == i && i!=4) ? "#ff0000" : "#000000",4);
			drawPoint(corners.at(i),"#ffffff",3);
		}
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

//#endregion

const EMPTY_VECT_RECT = new VectRect(new Point(-500,-500),new Point(-500,-500),"#ffffff",0);
var selectedVectRect = EMPTY_VECT_RECT;
var selectedVectRectID = -1;

//#region Array of 2D Vector Rectangles

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
			this.vectRects.at(selectedVectRectID).isSelected = true;
			selectedVectRect = this.vectRects.at(selectedVectRectID);
		}
		if(i==-1){
			this.vectRects.at(selectedVectRectID).isSelected = false;
			selectedVectRectID=-1;
			selectedVectRect=EMPTY_VECT_RECT;
		}
	}

	updateZOrder(){
		for(var i=0;i<this.vectRects.length;i++){
			this.vectRects.at(i).zOrder=i;
		}
	}
}

//#endregion

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
//#region Old Button Events

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
//#endregion

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

const drawPoint = (point,color,radius) => {
	ctx1.value.fillStyle = color;
	ctx1.value.beginPath();
	ctx1.value.arc(point.x, point.y, radius, 0, 2 * Math.PI);
	ctx1.value.fill();
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

//#region File Handling

// const testUser = (e) => {

// }
// import * as fs from 'fs';
// fs.writeFile("test.txt", jsonData, function(err) {
//     if (err) {
//         console.log(err);
//     }
// });

const tmpFile = ref("");
const writeFile = (e) => {
	if(isRasterMode.value){
		var canvasContents = canvas1.value.toDataURL(); // a data URL of the current canvas image
		var data = { image: canvasContents, date: Date.now() };
		tmpFile.value = JSON.stringify(data);
	}
	else{
		vrLayer.selectVectRect(-1);
		tmpFile.value = JSON.stringify(vrLayer.vectRects);
        window.localStorage.setItem('test', tmpFile.value);
		const blob = new Blob([tmpFile.value], {type: 'text/plain'});
    	const ev = document.createEvent('MouseEvents'),a = document.createElement('a');
    	a.download = "test.json";
    	a.href = window.URL.createObjectURL(blob);
    	a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
		ev.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(ev);
		vrLayer.redrawVectRects;
	}
}

// import { useFileDialog } from '@vueuse/core'

// const { files, open, reset, onChange } = useFileDialog({
//   accept: 'image/*', // Set to accept only image files
//   directory: true, // Select directories instead of files if set true
// })
// onChange((files) => {
//   /** do something with files */
// })

const loadFile = (e) => {
	if(isRasterMode.value){
		var data = JSON.parse(tmpFile.value);
		var image = new Image();
		image.onload = function () {
			ctx1.value.clearRect(0, 0, canvas1.value.width, canvas1.value.height);
			ctx1.value.drawImage(image, 0, 0); // draw the new image to the screen
		}
		image.src = data.image; // data.image contains the data URL
	}
	else{
		vrLayer.selectVectRect(-1);
		var input = document.createElement('input');
		input.type = 'file';
		input.onchange = ev => { 
			tmpFile.value = ev.target.files[0];
			// setting up the reader
			var reader = new FileReader();
			reader.readAsText(tmpFile.value,'UTF-8');
			// here we tell the reader what to do when it's done reading...
			reader.onload = readerEvent => {
				var content = readerEvent.target.result; // this is the content!
				var newVectRects = JSON.parse(content);
				vrLayer.vectRects = [];
				for(var i=0;i<newVectRects.length;i++){
					var vr = newVectRects.at(i);
					vrLayer.newVectRect(vr.point1,vr.point2,vr.color,vr.zOrder);
				}
				vrLayer.redrawVectRects();
			}
		}
		input.click();
	}
}
//#endregion

//#region Events

const selectColor = (color) => {
	if(isRasterMode.value){
		changeColor(color);
	}
	else{
		ctx1.value.strokeStyle = color;
		ctx1.value.fillStyle = color;
		selectedVectRect.color = color;
		if(selectedVectRectID>=0)vrLayer.vectRects.at(selectedVectRectID).color=color;
		vrLayer.redrawVectRects();
	}
	lastColor.value = color;
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
		if(isCreateMode.value!=true){

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
				else{
					vrLayer.selectVectRect(-1);
					vrLayer.redrawVectRects();
				}
			}
		}
		else{
			vrLayer.newVectRect(new Point(mouseLocation.x-20,mouseLocation.y-20),mouseLocation,lastColor.value,vrLayer.vectRects.length);
			vrLayer.selectVectRect(vrLayer.vectRects.length-1);
			vrLayer.redrawVectRects();
			isCreateMode.value=false;
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
}

const removeArrayElement = (from)=> {
	vrLayer.vectRects.splice(from, 1);

	vrLayer.updateZOrder();
}


const moveToTop = () => {
	if(vrLayer.vectRects.length > selectedVectRectID && selectedVectRectID>=0)
	{
		selectedVectRect = vrLayer.vectRects.at(selectedVectRectID);
		moveArrayElement(selectedVectRectID,vrLayer.vectRects.length-1);
		vrLayer.selectVectRect(vrLayer.vectRects.length-1);
		vrLayer.redrawVectRects();
	}
}

const moveToBottom = () => {
	if(vrLayer.vectRects.length > selectedVectRectID && selectedVectRectID>=0)
	{
		selectedVectRect = vrLayer.vectRects.at(selectedVectRectID);
		moveArrayElement(selectedVectRectID,0);
		vrLayer.selectVectRect(0);
		vrLayer.redrawVectRects();
	}
}

const moveUp = () => {
	if(vrLayer.vectRects.length > selectedVectRectID && selectedVectRectID>=0)
	{
		selectedVectRect = vrLayer.vectRects.at(selectedVectRectID);
		var newID = selectedVectRectID+1 >= vrLayer.vectRects.length ? vrLayer.vectRects.length-1 : selectedVectRectID+1;
		moveArrayElement(selectedVectRectID,newID);
		vrLayer.selectVectRect(newID);
		vrLayer.redrawVectRects();
	}
}

const moveDown = () => {
	if(vrLayer.vectRects.length > selectedVectRectID && selectedVectRectID>=0)
	{
		selectedVectRect = vrLayer.vectRects.at(selectedVectRectID);
		var newID = selectedVectRectID-1 <= 0 ? 0 : selectedVectRectID-1;
		moveArrayElement(selectedVectRectID,newID);
		vrLayer.selectVectRect(newID);
		vrLayer.redrawVectRects();
	}
}

const onClick = (e) => {
	if(!isRasterMode.value){
	}
}

const onCreateVectRect = (e) => {
	isCreateMode.value =true;
}

const onDeleteVectRect = (e) => {
	removeArrayElement(selectedVectRectID);
	vrLayer.selectVectRect(-1);
	vrLayer.redrawVectRects();
}

onMounted(() => {
	pixelsX.value = 1200;
	pixelsY.value = 650;

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


	debugvar.value = "-1";
});
//#endregion
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
	justify-content: left;
	width:100%;
	background-color: #fff;
}
#app>div{
	display:flex;
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
	margin: 5px;
	cursor: pointer;
	border-radius: 50%;
}

.color-picker{
	display:flex;
	width:120px;
	height:fit-content;
	flex-wrap:wrap;
}

/* tool bar */
.tool-picker {
	display: flex;
	margin: 0 10px;
	flex-direction: column;
}

/* tool button */
.tool-button {
	padding: 0 10px;
	margin: 3px;
	background-color: #fff;
	border-width: 2px;
	border-color: #333;
	border-radius: 5px;
	color: #333;
	text-align: center;
	cursor: pointer;
	text-decoration: none;
	font-weight:normal;
	font-size:14px;
}

.tool-button:hover {
	background-color: #eee;
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
	justify-content: top;
	display: flex;
	margin: 20px;
	flex-direction: column;
	width:200px;
}

#wrapper{
	margin:20px;
	position:relative;
	width:1200px;
	height:650px;
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