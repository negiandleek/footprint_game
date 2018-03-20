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
		this.treasure = DisplayElement().addChildTo(this);
		this.enemys = Enemys().addChildTo(this);

		// stageで上記を管理する
		this.stage.loading("stage", "text", 
			{
				collision_blocks: this.collision_blocks,
				blocks: this.blocks,
				enemys: this.enemys,
				treasure: this.treasure
			},
			this.player,
		);
		 
		// user画面
		this.user = User(this.player).addChildTo(this);
	},
	update: function(){
		this.goal(this.player, this.treasure);

		this.stage.move();

		this.damage(this.player, this.enemys);
	},
	goal: function(subjects, targets){
		let is = false;
		let pp = subjects.position;
		subjects.children.some((subject) => {
	  		let newrect = Rect(pp.x + subject.x, pp.y + subject.y, subject.width, subject.height);
      		targets.children.some((target)=>{
      			let _newrect = Rect(target.x, target.y, subject.width, subject.height);
	        	if(Collision.testRectRect(newrect, _newrect)){
	        		is = true;
	      		}
	        })
	    })

	    if(is){
	    	this.app.pushScene(Gameover_Scene(this, this.options, "クリア"));
        }
	},
	damage: function(subjects, targets){
		let is_crash = false;
		let pp = subjects.position;
		subjects.children.some((subject) => {
	  		let newrect = Rect(pp.x + subject.x, pp.y + subject.y, subject.width, subject.height);
      		targets.children.some((target)=>{
      			let _newrect = Rect(target.x + target.vx, target.y + target.vy, subject.width, subject.height);
	        	if(Collision.testRectRect(newrect, _newrect)){
	        		is_crash = true;
	      		}
	        })
	    })
	    if(is_crash){
	    	this.app.pushScene(Gameover_Scene(this, this.options));
	    }
	}
});