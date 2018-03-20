import {CONST} from "./CONST.js";
import "./Stage.js";
import "./Enemys.js";
import "./Player.js";
import "./Foot.js"
import "./User.js";

phina.define("PlayScene", {
	superClass: "DisplayScene",
	init: function(options){
		this.superInit(options);
		this.children.clear();
		this.options = options;

		// player
		this.player = Player().addChildTo(this);

		this.stage = Stage().addChildTo(this)
		this.collision_blocks = DisplayElement().addChildTo(this);

		// 様々なブロック
		this.blocks = DisplayElement().addChildTo(this);
		this.goals = DisplayElement().addChildTo(this);
		this.enemys = Enemys().addChildTo(this);

		// stageで上記を管理する
		this.stage.loading("stage", "text", 
			{
				collision_blocks: this.collision_blocks,
				blocks: this.blocks,
				enemys: this.enemys,
				goals: this.goals
			},
			this.player,
			12 * CONST.grid ,6 * CONST.grid
		);
		 
		// user画面
		this.user = User(this.player).addChildTo(this);

		this.four_corners = [-1,-1,1,-1,1,1,1,-1];
	},
	update: function(){
		// this.goal(this.player, this.goals);

		// this.collision_x(this.player, this.collision_blocks);
		// this.collision_y(this.player, this.collision_blocks);

		// this.collision_enemy_x(this.enemys, this.collision_blocks);
		// this.collision_enemy_y(this.enemys, this.collision_blocks);

		this.stage.move();

		// this.damage(this.player, this.enemys);
	},
	goal: function(subjects, targets){
		let is = false
		subjects.children.some((subject) => {
			let newx = subject.x + subject.vx;
			let newy = subject.y + subject.vy;
	  		let newcricle = Circle(newx, newy, subject.radius);
			targets.children.some((target) => {
	        	if(Collision.testCircleRect(newcricle,target)){
	        		is = true;
			    }
        	});
        })
        if(is){
	    	this.app.pushScene(Gameover_Scene(this, this.options, "クリア"));
        }
	},
	collision_enemy_x: function(subjects, targets){
		subjects.children.some((subject) => {
			if(subject.trace_mode)return;
			let newx = subject.x + subject.vx;
	  		let newcircle = Circle(newx, subject.y, subject.radius);
	  		let radius = subject.radius;
			targets.children.some((target) => {
	        	if(Collision.testCircleRect(newcircle,target)){
	        		// トレースモードの準備
	        		if(!subject.mode !== "TRACE"){
		        		subject.rotate_horizontal();
		        		if(subject.mode === "PATROL"){
		        			let temp = subject.route[subject.index].position;
		        			let p = {
		        				x: temp.x * CONST.grid,
		        				y: temp.y * CONST.grid
		        			};
		        			subject.ghost = p;
		        			subject.calc_way_of_turning(p);
		        		}else if(subject.mode === "HUNT"){
		        			let offset = $.get_offset();
		        			let p = {
		        				x: this.player.position.x + offset.x,
		        				y: this.player.position.y + offset.y
		        			};
		        			subject.ghost = p;
		        			subject.calc_way_of_turning(p);
		        		}
		        		subject.mode = "TRACE";
		        	}
	        		// 右に移動
	        		if(subject.vx > 0){
			            subject.x = target.left - radius;
			            subject.vx = 0;
			        }
			        // 左に移動
			        if(subject.vx < 0){
			            subject.x = target.right + radius;
			            subject.vx = 0;
			        }
			    }
        	});
        });
	},
	collision_enemy_y: function(subjects, targets){
		subjects.children.some((subject) => {
	  		if(subject.trace_mode)return;
			let newy = subject.y + subject.vy;
	  		let newcircle = Circle(subject.x, newy, subject.radius);
	  		let radius = subject.radius + 0.1;
			targets.children.some((target,i) => {
	        	if(Collision.testCircleRect(newcircle,target)){
	        		// トレースモードの準備
		        	if(!subject.mode !== "TRACE"){
		        		subject.rotate_vertical();
		        		if(subject.mode === "PATROL"){
		        			let temp = subject.route[subject.index].position;
		        			let p = {
		        				x: temp.x * CONST.grid,
		        				y: temp.y * CONST.grid
		        			};
		        			subject.ghost = p;
		        			subject.calc_way_of_turning(p);
		        		}else if(subject.mode === "HUNT"){
		        			let offset = $.get_offset();
		        			let p = {
		        				x: this.player.position.x + offset.x,
		        				y: this.player.position.y + offset.y
		        			};
		        			subject.ghost = p;
		        			subject.calc_way_of_turning(p);
		        		}
		        		subject.mode = "TRACE";
		        	}
	        		// 下に移動
	        		if(subject.vy > 0){
			            subject.y = target.top - radius;
			            subject.vy = 0;
			        }
			        // 上に移動
			        if(subject.vy < 0){
			            subject.y = target.bottom + radius;
			            subject.vy = 0;
		        	}
			    }
        	});
        })
	},
	damage: function(subjects, targets){
		let is_crash = false;
		let pp = subjects.position;
		subjects.children.some((subject) => {
	  		let newrect = Rect(pp.x + subject.x, pp.y + subject.y, subject.width, subject.height);
      		targets.children.some((target)=>{
      			let _newrect = Rect(target.x + target.vx, target.y + target.vy, subject.width, subject.height);
	        	if(Collision.testRectRect(newrect, _newrect)){	
	        		target.hunt();
	        		is_crash = true;
	      		}
	        })
	    })
	    if(is_crash){
	    	this.app.pushScene(Gameover_Scene(this, this.options));
	    }
	}
});