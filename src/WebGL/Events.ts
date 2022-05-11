import { Vec2 } from "./Types";

let mousePos: Vec2 = {
	x: 0,
	y: 0
}

let curkeys: boolean[] = [];
let mouseButton: boolean[] = [];

window.addEventListener("keydown", (e) => {
	curkeys[Number(e.keyCode)] = true;
	// console.log(curkeys);
});
window.addEventListener("keyup", (e) => {
	curkeys[Number(e.keyCode)] = false;
});
window.addEventListener("mousemove", (e)=>{
	const cav:HTMLElement = document.getElementsByTagName("canvas")[0];
	mousePos.x = e.clientX - cav.offsetLeft;
	mousePos.y = e.clientY - cav.offsetTop;
})
window.addEventListener("mousedown", (e) =>{
	mouseButton[e.button] = true;
})
window.addEventListener("mouseup", (e) =>{
	mouseButton[e.button] = false;
})

window.addEventListener("touchmove", (e)=>{
	let maintouch = e.changedTouches[0];
	mousePos.x = maintouch.clientX - cav.offsetLeft;
	mousePos.y = maintouch.clientY - cav.offsetTop;
})

window.addEventListener("touchstart", (e)=>{
	mouseButton[0] = true;
	let maintouch = e.changedTouches[0];
	mousePos.x = maintouch.clientX - cav.offsetLeft;
	mousePos.y = maintouch.clientY - cav.offsetTop;
})

window.addEventListener("touchend", (_)=>{
	mouseButton[0] = false;
})

export { curkeys, mouseButton, mousePos }
