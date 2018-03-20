import {CONST} from "./CONST.js";

phina.define("Foot", {
	superClass: "CircleShape",
	init: function(player, isLeft){
		this.player = player;
		this.superInit({
			radius: player.radius / 2,
			fill: CONST.color.white,
			stroke: false,
			y: (isLeft? -36 : 36),
			x: 0
		});
		this.interval = CONST.player.foot.interval;
		this.is_left = isLeft;
		this.count = isLeft? 15: 30;
	},
	update: function(){
		if(this.player.vx !== 0 || this.player.vy !== 0){
			if(this.count === this.interval){
					this.x = 36;
					this.y = this.is_left? -36: 36;
					this.count = 0;
			}else{
				this.x += -1 * this.player.vx;
				this.y += -1 * this.player.vy;
			}
			this.count += 1;
		}else{
			this.count = this.is_left? 15 : 30;
		}
	}
});