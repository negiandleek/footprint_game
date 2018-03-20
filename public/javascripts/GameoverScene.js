import {CONST} from "./CONST.js";

phina.define("Gameover_Scene", {
superClass: 'DisplayScene',
 	init: function(scene, param, text) {
		this.superInit({
			width: CONST.screen.width,
			height: CONST.screen.height,
			backgroundColor: "rgba(0, 0, 0, 0.5)"
		});

		let container = RectangleShape({
			width: 320,
			height: 240,
			fill: CONST.color.white,
			stroke: null,
			cornerRadius:10
		}).addChildTo(this)
		.setPosition(this.gridX.center() * 2 + 320, this.gridY.center());
		container.tweener.to({
			x: this.gridX.center()
		},500, "easeInOutQuint")

		Label({
	      	text: (text? text: "ゲームオーバー"),
	      	fontSize: 32,
	    }).addChildTo(container)
	    .setPosition(this.gridX.span(0), this.gridY.span(-1));

	    let button_outer = RectangleShape({
	    	width: 320,
			height: 80,
			fill: CONST.color.light_gray,
			stroke: null,
			cornerRadius: 10
	    }).addChildTo(container)
	    .setPosition(0, 80);

		let button = Button({
			text: "やりなおす",
			fontSize: 32,
			fill: CONST.color.green,
			stroke: null,
			cornerRadius: 30,
			width: 280,
			height: 60
		}).addChildTo(button_outer);

		let self = this;

		button.onpush = function(){
			// self.exit();
			// scene.init(param);
			location.reload();			
		}
	}

});
