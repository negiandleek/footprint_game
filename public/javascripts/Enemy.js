import {CONST} from "./CONST.js";

phina.define("Enemy", {
	superClass: "CircleShape",
	init: function(options){
		options.$extend({
			radius: 32,
			fill: "red",
			stroke: false,
			x: options.route[0].position.x * CONST.grid,
			y: options.route[0].position.y * CONST.grid
		})
		this.superInit(options);

		this.is_turn = false;
		this.is_stop = false;
		this.is_clockwise = true;

		this.is_contact_x = false;
		this.is_contact_y = false;

		this.is_moving = false;
		this.velocity = options.velocity;
		this.ghost;
		this.vison_angle = options.vison_angle;
		this.vison_long = options.vison_long;
		this.vx = 0;
		this.vy = 0;
		this.x_movement = 0;
		this.y_movement = 0;
		this.__rotation = this.__rotation__ = 0;

		this.player = options.player;
		this.collision_map = options.collision_map;
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
	set_movement: function(){
		let rad = this.__rotation / 180 * Math.PI;
	
		this.x_movement = (function(self){
			let n = Math.cos(rad) * 10 | 0;
			let r = n === 0? 0: Math.cos(rad) * self.velocity;
			return r;
		})(this);

		this.y_movement = (function(self){
			let n = Math.sin(rad) * 10 | 0;
			let r = n === 0? 0: Math.sin(rad) * self.velocity;
			return r;
		})(this);
	},
	calc_way_of_turning: function(target){
		let ep = $.calc_square(this.x, this.y);
		let tp = this.ghost;
		let diff_angle = $.calc_rotation(tp, ep, true);
		let normalize_degree = (function(self){
			let r = Math.floor((diff_angle - self.__rotation) % 360);
			r = r < 0? r + 360: r;
			return r;
		})(this);
		if(0 <= normalize_degree && normalize_degree <= 180){
			this.is_clockwise = true;
		}else{
			this.is_clockwise = false;
		}
	},
	calc_four_direction_square: function(){
		let r = this.__rotation;
		let d = [];
		if(this.is_clockwise){
			// 右、前、左
			if(r === 0){
				d = [0,1,1,0,0,-1];
			}else if(r === 90){
				d = [-1,0,0,1,1,0];
			}else if(r === 180){
				d = [0,-1,-1,0,0,1];
			}else if(r === 270){
				d = [1,0,0,-1,-1,0];
			}
		}else{
			// 左、前、右
			if(r === 0){
				d = [0,-1,1,0,0,1];
			}else if(r === 90){
				d = [1,0,0,1,-1,0];
			}else if(r === 180){
				d = [0,1,-1,0,0,-1];
			}else if(r === 270){
				d = [-1,0,0,-1,1,0];
			}
		}
		return d;
	},
	tracing: function(){
		let offset = $.get_offset();
		let p = $.calc_square(this.x, this.y);

		let ds = this.calc_four_direction_square();
		let d = -1;

		if(this.is_clockwise){
			for(let i = 0; i < 6; i += 2){
				if(this.collision_map[p.y + ds[i+1]][p.x + ds[i]] !== 0){
					d = i / 2;
					break;
				};
			}
		}else{
			for(let i = 0; i < 6; i += 2){
				if(this.collision_map[p.y + ds[i+1]][p.x + ds[i]] !== 0){
					d = i / 2;
					break;
				};
			}
		}

		if(this.is_clockwise){
			// 右
			if(d === 0){
			　	this.__rotation += 90;
			// 前
			}else if(d === 1){
				this.__rotation += 0;
			// 左
			}else if(d === 2){
				this.__rotation += 270;
			// 後ろ
			}else{
				this.__rotation += 180;
			}
		}else{
			// // 左
			if(d === 0){
			　	this.__rotation += 270;
			// 前
			}else if(d === 1){
				this.__rotation += 0;
			// 右
			}else if(d === 2){
				this.__rotation += 90;
			// 後ろ
			}else{
				this.__rotation += 180;
			}
		}
		
		if(this.__rotation >= 360){
			this.__rotation -= 360;
		}
	}
})

phina.define("Human", {
	superClass: "Enemy",
	init: function(options){
		this.superInit(options);
		
		this.pace = options.tracking.interval;
		this.count = 0;

		this.r_rad = 90 * Math.PI / 180;
		this.l_rad = 270 * Math.PI / 180;
		this.is_right = true;
		this.shoulder_width = options.tracking.shoulder_width;
	
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
		let rotation = !this.is_turn? this.__rotation: this.__rotation_previous;
		let rotation_rad = rotation * Math.PI / 180;
		
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

		context.rotation = rotation;

		return {
			x: x,
			y: y
		};
	},
	track: function(){
		this.set_foot_position();
		if(this.vx === 0 && this.vy === 0 && !this.is_turn){
			this.set_foot_position();
			// 止まっていたら速度と角度を更新
			if(this.is_stop){
				this.is_stop = !this.is_stop;
				// let v = this.calc_velocity();
				// this.vx = v.vx;
				// this.vy = v.vy;
			}
		}
		if(this.is_turn){
			this.is_turn = !this.is_turn;
		}
	},
	work: function(){
		// if(this.count === this.pace){
		// 	// this.track();
		// 	this.count = 0;
		// }else{
		// 	this.children.some((child)=>{
		// 		child.x -= this.vx;
		// 		child.y -= this.vy;
		// 	});
		// 	this.count += 1;
		// }
		// this.rotation += this.__rotation;
		//console.log(this.rotation)
		// console.log(this.rotation);
	},
})

phina.define("TheSlippers",{
	superClass: "Human",
	init: function(options){
		this.superInit(options);

		this.route = options.route;
		this.index = this.route[0].connection[0];
		this.interval_count = 0;

		// PATROL, HUNT, TRACE
		this.mode = "PATROL";

		// 最初の動きを定義
		this.patrol();
	},
	// bend: function(deg){
	// 	this.vx = 0;
	// 	this.vy = 0;
	// 	this.is_turn = true;
	// 	this.is_stop = true;
	// 	this.__rotation_previous = this.__rotation;
	// 	this.__rotation = deg;
	// },
	// change_direction: function(p){
	// 	let x = this.route[this.index].position.x;
	// 	let y = this.route[this.index].position.y;
	// 	if(x === p.x && y === p.y){
 // 			// randomにルートを選択するか固定
	// 		let nindex = this.route[this.index].connection[0];
	// 		let np = this.route[nindex].position;
	// 		let deg = this.calc_rotation(np, p, true);
	// 		this.bend(deg);
	// 		this.index = nindex;
	// 	}
	// },
	lockon: function(){
		if(this.hit_test()){
			return;
		}
		let deg = $.calc_rotation(this.player.position, this.position, true);
		let dis = $.calc_distance(this.player.position, this.position);
		let normalize = (function(self){
			let r = deg - self.__rotation;
			r = r < 0? r + 360: r;
			return r;
		})(this);
		let in_vision = (
			(360 - this.vison_angle) <= normalize && normalize <= 360 || 
			(0 <= normalize && normalize <= this.vison_angle) ||
			normalize === 270 ||
			normalize === 90
		);
		
		// HUNTモード切り替え
		if(in_vision && dis <= Math.pow(this.vison_long,2)){
			this.mode = "HUNT";
		}else if(this.mode = "HUNT"){
			this.mode = "PATROL";
		}
	},
	pass_to_checkpoint: function(){
		if(this.mode === "PATROL"){
			let x = this.route[this.index].position.x;
			let y = this.route[this.index].position.y;
			let p = $.calc_square(this.x, this.y);

			if(x === p.x && y === p.y){
				this.index = this.route[this.index].connection[0];
			}
		}else if(this.mode === "TRACE"){
			let gp = this.ghost;
			let ep = $.calc_square(this.x, this.y);
			if(ep.x === gp.x && ep.y === gp.y){
				this.mode = "PATROL";
			}
		}
	},
	patrol: function(){
		let offset = $.get_offset();
		let p = $.calc_square(this.x, this.y);
		let np = this.route[this.index].position;
		let deg = $.calc_rotation(np, p, true);

		if((0 <= deg && deg < 45) || 315 <= deg){
			this.__rotation = 0;
		}else if(45 <= deg && deg < 135){
			this.__rotation = 90;
		}else if(135 <= deg && deg < 225){
			this.__rotation = 180;
		}else if(225 <= deg && deg < 315){
			this.__rotation = 270;
		}

		this.set_movement();
		this.ghost = np;
	},
	hunt: function(){
		let offset = $.get_offset();
		let ps = $.calc_square(this.player.x, this.player.y);
		let es = $.calc_square(this.x, this.y);
		let deg = $.calc_rotation(ps, es, true);
		deg = deg < 0? deg + 360: deg;

		if((0 <= deg && deg < 45) || 315 <= deg){
			this.__rotation = 0;
		}else if(45 <= deg && deg < 135){
			this.__rotation = 90;
		}else if(135 <= deg && deg < 225){
			this.__rotation = 180;
		}else if(225 <= deg && deg < 315){
			this.__rotation = 270;
		}

		if(ps.x !== es.x || ps.y !== es.y){	
			this.set_movement();
		}

		this.ghost = ps;
	},
	trace: function(){
		this.calc_way_of_turning();
		this.tracing();
		this.set_movement();
	},
	move: function(){
		let offset = $.get_offset();

		if(Math.floor(this.x + offset.x) % CONST.grid === 0 && Math.floor(this.y + offset.y) % CONST.grid === 0){
			this.lockon();
			this.pass_to_checkpoint();

			this.is_moving = false;
			this.vx = this.x_movement = 0;
			this.vy = this.y_movement = 0;

			// 次の動きを定義
			if(this.mode === "PATROL"){
				this.patrol();
			}else if(this.mode === "HUNT"){
				this.hunt();
			}else if(this.mode === "TRACE"){
				this.trace();
			}
		}

		if((this.x_movement || this.y_movement) && 
		!this.is_moving){
			if(!this.hit_test()){
				this.is_moving = true;
				// 速度と回転を適応
				this.vx = this.x_movement;
				this.vy = this.y_movement;
				this.rotation = this.__rotation;
				this.__rotation__ = this.__rotation;
			}else{
				this.mode = "TRACE"
				this.__rotation = this.__rotation__;
			}
		}
	}
})