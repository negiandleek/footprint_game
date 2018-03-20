import {CONST} from "./CONST.js";
phina.define("Line", {
	superClass: "DisplayElement",
	init: function(x, y, type, isDisappear){
		this.superInit({
			x: x,
			y: y
		});
		this.width = CONST.grid;
		this.height = CONST.grid;
		this.hh = this.wh = CONST.grid / 2;
		this.is_disappear = isDisappear;
		let stroke_color = CONST.color.black;
		let stroke_width = CONST.outline.width;
		let paths;
		type = (type - 5) % 12;
		switch(type){
			// 上
			case 0:
				paths = [
					Vector2(-this.wh, -this.hh), 
					Vector2(this.wh, -this.hh)
				];
				break;
			// 右
			case 1:
				paths = [
					Vector2(this.wh, - this.hh), 
					Vector2(this.wh, this.hh)
				];
				break;
			// 下
			case 2:
				paths = [
					Vector2(-this.wh, this.hh), 
					Vector2(this.wh, this.hh)
				];
				break;
			// 左
			case 3:
				paths = [
					Vector2(-this.wh, -this.hh), 
					Vector2(-this.wh, this.hh)
				];
				break;
			// 上右
			case 4:
				paths = [
					Vector2(-this.wh, -this.hh), 
					Vector2(this.wh, -this.hh), 
					Vector2(this.wh, this.hh)
				];
				break;
			// 右下
			case 5:
				paths = [
					Vector2(this.wh, -this.hh), 
					Vector2(this.wh, this.hh),
					Vector2(-this.wh, this.hh)
				];
				break;
			// 下左
			case 6:
				paths = [
					Vector2(this.wh, this.hh),
					Vector2(-this.wh, this.hh), 
					Vector2(-this.wh, -this.hh)
				];
				break;
			// 左上
			case 7:
				paths = [
					Vector2(- this.wh, this.hh),
					Vector2(- this.wh, -this.hh), 
					Vector2(this.wh, -this.hh)
				];
				break;
			default:
				break;
		}

		PathShape({
			width: this.width,
			height: this.height,
			stroke: stroke_color,
			strokeWidth: stroke_width,
			paths: paths
		})
		.addChildTo(this);

		if(this.is_disappear){
			// this.alpha = 0;
		}
	},
	illuminate: function(){
		if(this.is_disappear){
			// this.tweener.clear().fadeIn(100).wait(750).fadeOut(200).play();
		}
	}
});