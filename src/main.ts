import './style.css'

const app = document.querySelector<HTMLDivElement>('#app');
const canv = app?.appendChild(document.createElement("canvas"))
const c = canv?.getContext("webgl")