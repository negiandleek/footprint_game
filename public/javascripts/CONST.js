let CONST = {
	grid: 64,
	screen: {
		width: 960,
		height: 640
	},
	color: {
		black: "#000",
		white: "#fff",
		red: "#ef5350",
		green: "#009688",
		blue: "#1565C0",
		gray: "#EEEEEE",
		yellow: "#FFEE58"
	},
	outline: {
		width: 4
	},
	virtual_pad:{
		out: 100,
		in: 40,
		arrow: 20,
		alpha: 0.8,
	},
	player: { 
		width: 32,
		height: 32,
		velocity: 4, 
		walking: {
			interval: 13,
			shoulder_width: 12
		}
	},
	enemy: {
		velocity: 3,
		walking: {
			interval: 15,
			shoulder_width: 12
		}
	}
}
 
export {CONST};