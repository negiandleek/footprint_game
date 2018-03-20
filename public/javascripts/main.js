import {CONST} from "./CONST.js";
import {ASSETS} from "./ASSETS.js";
import "./PlayScene.js";
import "./GameoverScene.js";

let $ = window.$ = (function(){
	let offset = {
		x: 0,
		y: 0
	};
	function set_offset(x, y){
		offset.x += x;
		offset.y += y;

		return true;
	}
	function get_offset(){
		return offset;
	}
	function calculate_deg (subject, target){
		if(typeof subject === "undefined" || typeof target === "undefined"){
			throw("error");
		}
		let diff_x = target.x - subject.x;
		let diff_y = target.y - subject.y;
		let rad = Math.atan2(diff_y, diff_x);
		let deg = rad * 180 / Math.PI;
		return deg;
	}
	function calc_square(x, y){
		let r = $.get_offset();
		let w = Math.floor((x + r.x) / CONST.grid);
		let h = Math.floor((y + r.y) / CONST.grid);

		return {
			x: w, 
			y: h
		}
	}
	function calc_rotation(target, subject){
		let dx = target.x - subject.x;
		let dy = target.y - subject.y;
		let deg = Math.atan2(dy, dx);

		// radに変換
		if(arguments.length >= 3  && arguments[2]){
			deg = deg * 180 /  Math.PI;
			deg = deg < 0? deg + 360: deg;
		}
		return deg;
	}
	function calc_distance (target, subject){
		let dx = target.x - subject.x;
		let dy = target.y - subject.y;
		let dis = dx * dx + dy * dy;

		if(arguments.length >= 3  && arguments[2]){
			dis = Math.sqrt(dis);
		}
		return dis;
	}
	return {
		calculate_deg: calculate_deg,
		set_offset: set_offset,
		get_offset: get_offset,
		calc_square: calc_square,
		calc_rotation: calc_rotation,
		calc_distance: calc_distance
	}
}());
 
phina.main(() => {
	let app = GameApp({
		startLabel: "play_scene",
		scenes: [
			{
				label: "play_scene",
				className: "PlayScene"
			},
			{
				label: "gameover_scene",
				className: "Gameover_Scene"
			}
		],
		assets: ASSETS,
		fps: 30,
		width: CONST.screen.width,
		height: CONST.screen.height,
		backgroundColor: CONST.color.white,
	});
	// app.enableStats();
	app.run();
});