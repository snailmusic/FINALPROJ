function randInt(min:number, max:number) :number {
	return Math.floor(Math.random() * (max - min) + min);
}

function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, min), max);
}

export {randInt, clamp};