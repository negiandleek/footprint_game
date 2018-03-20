import {CONST} from "./CONST.js";

phina.define("Player", {
	superClass: "CircleShape",
	init: function(){
		this.superInit({
			radius: 32,
			fill: false,
			stroke: false
		});
		let json = AssetManager.get("text", "player").data;
		json = JSON.parse(json).player;

		this.vx = 0;
		this.vy = 0;
		this.x_movement;
		this.y_movement;
		this.__rotation = 0;

		this.pace = json.walking.interval;
		this.shoulder_width = json.walking.shoulder_width;
		this.r_rad = 90 * Math.PI / 180;
		this.l_rad = 270 * Math.PI / 180;
		this.is_right = true;
		this.count = 0;
		this.is_moving = false;

		this.collision_map;

		this.add_right_foot();
		this.add_left_foot();
	},
	add_right_foot: function(){
		this.right_foot = Sprite("right_foot").addChildTo(this);
		this.set_foot_position();
	},
	add_left_foot: function(){
		this.left_foot = Sprite("left_foot").addChildTo(this);
		this.set_foot_position();
	},
	set_foot_position: function(){
		let rad;
		let context;
		let x;
		let y;
		let rotation_rad = this.__rotation * Math.PI / 180;
		
		if(this.is_right){
			rad = this.r_rad + rotation_rad;
		}else{
			rad = this.l_rad + rotation_rad;
		}

		if(this.is_right){
			context = this.right_foot;
		}else{
			context = this.left_foot;
		}

		this.is_right = !this.is_right;

		x = Math.cos(rad) * this.shoulder_width;
		y = Math.sin(rad) * this.shoulder_width;

		context.setPosition(x, y);
		context.rotation = this.__rotation;

		return {
			x: x,
			y: y
		};

	},
	track: function(){
		this.set_foot_position();
		if(this.vx === 0 && this.vy === 0){
			this.set_foot_position();
		}
	},
	hit_test: function(){
		let is = false;
		let r = $.calc_square(this.x, this.y);
		let i;
		let j;
		if(this.x_movement < 0){
			i = -1;
		}else if(this.x_movement > 0){
			i = 1;
		}else{
			i = 0;
		}

		if(this.y_movement < 0){
			j = -1;
		}else if(this.y_movement > 0){
			j = 1;
		}else{
			j = 0;
		}

		r.x = r.x + i;
		r.y = r.y + j;
  		
  		if(this.collision_map[r.y][r.x] === 0){
  			is = true;
  		}

		return is;
	},
	move: function() {
		let offset = $.get_offset();

		if(this.is_moving){
			this.x += this.vx;
			this.y += this.vy;
		}

		if((this.vx && (this.x + offset.x) % CONST.grid === 0) || 
		(this.vy && (this.y + offset.y) % CONST.grid === 0)){
			this.is_moving = false;
			this.vx = 0;
			this.vy = 0;
		}

		if((this.x_movement || this.y_movement) && 
		!this.is_moving &&
		!this.hit_test()){
			this.is_moving = true;
			this.vx = this.x_movement;
			this.vy = this.y_movement;
		}
	},
	update: function(){
		if(this.count === this.pace){
			this.track();
			this.count = 0;
		}else{
			this.children.some((child)=>{
				child.x -= this.vx;
				child.y -= this.vy;
			});
			this.count += 1;
		}
	}
});
