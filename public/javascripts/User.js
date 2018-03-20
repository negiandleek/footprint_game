import {CONST} from "./CONST.js";

phina.define("User", {
	superClass: "DisplayElement",
	init: function(player){
		this.superInit();

		let json = AssetManager.get("text", "player").data;
		json = JSON.parse(json).player;
		
		this.player = player;
		this.rotate = 0;
		this.vx = 0;
		this.vy = 0;
		this.r = CONST.virtual_pad.out - CONST.virtual_pad.in;

		// virtual pad
		// パッドの動かせる範囲
		this.virtual_pad = CircleShape({
			radius: CONST.virtual_pad.out,
			fill: CONST.color.gray,
			stroke: CONST.color.light_gray,
			x: 60,
			y: 60
		}).addChildTo(this);
		this.virtual_pad.alpha = CONST.virtual_pad.alpha;
		
		// 初期時は隠す
		this.virtual_pad.hide();

		// 矢印
		let i = 0;
		while(i < 4){
			let x = 0;
			let y = 0;
			switch(i){
				// 上
				case 0:
					x = 0;
					y = -40;
					break;
				// 右
				case 1:
					x = 40;
					y = 0;
					break;
				// 下
				case 2:
					x = 0;
					y = 40;
					break;
				//　左
				case 3:
					x = -40;
					y = 0;
					break;
			}
			let arrow = TriangleShape({
				fill: CONST.color.white,
				stroke: null,
				radius: CONST.virtual_pad.arrow,
				x: x,
				y: y
			}).addChildTo(this.virtual_pad);
			arrow.rotation = i * 90;
			arrow.alpha = CONST.virtual_pad.alpha;
			i += 1;
		}
		// 動かせるパッド部分
		this.pad = CircleShape({
			radius: CONST.virtual_pad.in,
			fill: CONST.color.red,
			stroke: CONST.color.light_gray,
		}).addChildTo(this.virtual_pad);
		this.pad.alpha = CONST.virtual_pad.alpha;

		// 操作できるようにレイヤーを追加
		let handle_display = RectangleShape({
			width: CONST.screen.width,
			height: CONST.screen.height,
			fill: null,
			stroke: null
		}).addChildTo(this);
		
		// 左上を原点とする
		handle_display.origin.set(0, 0)
		handle_display.x = 0;
		handle_display.y = 0;

		// タッチイベント可
		handle_display.setInteractive(true);
		
		handle_display.on("pointstart",(e)=>{
			this.virtual_pad.show();
			this.target_position = {
				x: e.pointer.x,
				y: e.pointer.y
			};

			this.virtual_pad.setPosition(e.pointer.x, e.pointer.y);
		});

		handle_display.on("pointmove",(e)=>{
			let x = e.pointer.x - this.target_position.x;
			let y = e.pointer.y - this.target_position.y;
			let velocity = json.velocity;
			let deg = $.calculate_deg(this.target_position, e.pointer);
			let rad = deg / 180 * Math.PI;
			this.rotate = deg;

			if(Math.pow(x,2) + Math.pow(y,2) <= Math.pow(this.r, 2)){
				this.pad.setPosition(x, y);
			}else{
				x = Math.cos(rad) * this.r;
				y = Math.sin(rad) * this.r;
				this.pad.setPosition(x, y);
			}

			deg = deg < 0? deg + 360: deg;
			if((0 <= deg && deg < 45) || 315 <= deg){
				this.x_movement = velocity;
				this.y_movement = 0;
			}else if(45 <= deg && deg < 135){
				this.x_movement = 0
				this.y_movement = velocity;
			}else if(135 <= deg && deg < 225){
				this.x_movement = -velocity;
				this.y_movement = 0;
			}else if(225 <= deg && deg < 315){
				this.x_movement = 0;
				this.y_movement = -velocity;
			}
		});

		handle_display.on("pointend", (e)=>{
			this.virtual_pad.hide();
			this.pad.setPosition(0, 0);
			// pointend時にupdateが適応されない
			this.player.x_movement = this.x_movement = 0;
			this.player.y_movement = this.y_movement = 0;
		});
	},
	update: function(app) {
		if(app.pointer.getPointing()){
			this.player.x_movement = this.x_movement;
			this.player.y_movement = this.y_movement;
			this.player.__rotation = this.rotate;
		}
	}
});