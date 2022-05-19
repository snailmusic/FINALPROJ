// Random helper functions that I found useful

// generates a random integer between max and min not including max
function randInt(min:number, max:number) :number {
	return Math.floor(Math.random() * (max - min) + min);
}

// "clamps" a number between the min and max
// this should really be built in lol
function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, min), max);
}

// generates a range of numbers from start to end
// basically just python's range() function
// best part of that language imo (even though haskell's [1...10] is better)
function range(start: number, end?: number) {
	start = end == undefined ? 0 : start;
	end = end || start;

	return Array.from({ length: end - start + 1 }, (_, i) => i);
}

export {randInt, clamp, range};