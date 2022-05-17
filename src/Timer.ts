export default class Timer {
	startTime: Date;
	dur: number;
	constructor(time: number) {
		this.startTime = new Date();
		this.dur = time;
	}

	check(){
		const curTime = new Date()
		const relTime = curTime.valueOf() - this.startTime.valueOf();
		return relTime >= this.dur;
	}
	
	reset(dur?:number){
		this.startTime = new Date();
		if (dur != undefined) {
			this.dur = dur;
		}
	}
}