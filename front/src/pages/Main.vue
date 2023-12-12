<template>
	<h2>{{ message }}</h2>
	<div class="color-picker">
			<div v-for="color in colors" class="color-box" :style="{ backgroundColor: color }" @click="changeColor(color)"></div>
	</div>
	<canvas @mousedown="startPainting" @mouseup="finishedPainting" @mousemove="draw" id="canvas"></canvas>
	<a class="clear-button" @click.prevent="clearCanvas">Clear Canvas</a>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const message = ref("Drawing App");
const painting = ref(false);
const canvas = ref(null);
const ctx = ref(null);
const colors = ref(["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]);
const changeColor = (color) => {
	ctx.value.strokeStyle = color;
};

const clearCanvas = () => {
	ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
};

const startPainting = (e) => {
	painting.value = true;
	draw(e);
};

const finishedPainting = () => {
	painting.value = false;
	ctx.value.beginPath();
};

const draw = (e) => {
	if (!painting.value) return;

	ctx.value.lineWidth = 10;
	ctx.value.lineCap = "round";

	ctx.value.lineTo(e.clientX - canvas.value.offsetLeft, e.clientY - canvas.value.offsetTop);
	ctx.value.stroke();

	ctx.value.beginPath();
	ctx.value.moveTo(e.clientX - canvas.value.offsetLeft, e.clientY - canvas.value.offsetTop);
};

onMounted(() => {
	canvas.value = document.getElementById("canvas");
	ctx.value = canvas.value.getContext("2d");

	// Set default stroke color
	ctx.value.strokeStyle = colors.value[0];

	// Resize canvas
	canvas.value.height = window.innerHeight * 0.6;
	canvas.value.width = window.innerWidth * 0.8;
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
	display: block;
	background-color: #ffffff;
	border: 2px solid #333;
	border-radius: 5px;
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

.color-picker {
	display: flex;
	justify-content: center;
	margin-bottom: 1rem;
}

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
</style>