import {CONST} from "./CONST.js"
phina.define("Block", {
	superClass: "RectangleShape",
	init: function(options, type, isDisappear){
		this.superInit(options);
		this.type = type;
		this.is_disappear = isDisappear;
		this.wh = CONST.grid/2;
		this.hh = CONST.grid/2;
		if(this.is_disappear){
			this.alpha = 0;
		}
	},
	illuminate: function(){
		if(this.is_disappear){
			this.tweener.clear().fadeIn(100).wait(750).fadeOut(200).play();
		}
	}
});