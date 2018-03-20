import {CONST} from "./CONST.js";
import "./Block.js";
import "./Line.js";
import "./Enemy.js";

    phina.define("Stage", {
    superClass: "DisplayElement",
    init: function(){
    	this.superInit();
        this.absdis_x = 0;
        this.absdis_y = 0;
        this.item_keys = [];
    },
    loading: function(stageName, assetType, items, player, x, y){
        this.stage_map = [];
        this.collision_map = [];
        this.enemys_map;
        this.player = player;

        for(let key in items){
            this[key] = items[key];
            this.item_keys.push(key);
        }

        // stage map
    	let stage_json = AssetManager.get(assetType, stageName).data;
        let text = JSON.parse(stage_json).layers[0];

        for(let i = 0, iz = text.height; i < iz; i+=1){
            this.stage_map[i] = [];
            for(let j = 0, jz = text.width; j < jz; j+=1){
                let n = Number(text.data[i * text.width + j]) - 1;
                this.stage_map[i].push(n)
            }
        }

        // collision map
        text = JSON.parse(stage_json).layers[1];

        for(let i = 0, iz = text.height; i < iz; i+=1){
            this.collision_map[i] = [];
            for(let j = 0, jz = text.width; j < jz; j+=1){
                let n = Number(text.data[i * text.width + j]) - 1;
                this.collision_map[i].push(n);
            }
        }

        // enemys
        let enemys_json = AssetManager.get(assetType, stageName + "_enemy").data;
        this.enemys_map = JSON.parse(enemys_json)[stageName];


        this.generate_blocks();
        this.generate_collision_blocks();
        this.generate_enemys();
        
        text = JSON.parse(stage_json);

        this.player.x = text.start.x * CONST.grid;
        this.player.y = text.start.y * CONST.grid;
        this.player.collision_map = this.collision_map;
    },
    generate_blocks: function(){
         // 縦
        for(let i = 0, iz = this.stage_map.length; i < iz; i += 1){
            // 横
            for(let j = 0, jz = this.stage_map[0].length; j < jz; j += 1){
                let n = this.stage_map[i][j];
                // TODO: 綺麗にする
                if(5 <= n && n <= 16){
                    Line(
                        j * CONST.grid, 
                        i * CONST.grid,
                        n,
                        false
                    )
                    .addChildTo(this.blocks)
                }else if(17 <= n && n <= 28){
                    Line(
                        j * CONST.grid, 
                        i * CONST.grid,
                        n,
                        true
                    )
                    .addChildTo(this.blocks)
                }else if(n === 99){
                    Sprite("treasure")
                    .addChildTo(this.treasure)
                    .setPosition(j * CONST.grid, i * CONST.grid)
                }
            }
        }
    },
    generate_collision_blocks: function(){
        for(let i = 0, iz = this.collision_map.length; i < iz; i += 1){
            // 横
            for(let j = 0, jz = this.collision_map[0].length; j < jz; j += 1){
                let n = this.collision_map[i][j];
                // TODO: Shapeではなくプレイヤー位置との参照で行う
                if(n > -1){
                    RectangleShape({
                        x: j * CONST.grid, 
                        y: i * CONST.grid,
                        width: CONST.grid,
                        height: CONST.grid,
                        fill: "green",
                        stroke: false
                    })
                    .addChildTo(this.collision_blocks)
                }
            }
        }
    },
    generate_enemys: function(){
        for(let i = 0, iz = this.enemys_map.length; i < iz ;i += 1){
            let info = this.enemys_map[i];
            let cls = Object.keys(info);
            info[cls].collision_map = this.collision_map;
            info[cls].player = this.player
            phina.global[cls](
                info[cls],
            ).addChildTo(this.enemys);
        }
    },
    calc_offset: function(position){
        let offset_x = position.x - CONST.screen.width / 2;
        let offset_y = position.y - CONST.screen.height / 2;
        return {vx: offset_x, vy: offset_y};
    },
    move: function(){
        this.player.move();

        let offset = this.calc_offset(this.player.position);
        $.set_offset(offset.vx, offset.vy);

        this.absdis_x += offset.vx;
        this.absdis_y += offset.vy;
        
        this.player.x -= offset.vx;
        this.player.y -= offset.vy;

        for(let i = this.item_keys.length - 1; i >= 0; i -= 1){
            let key = this.item_keys[i];
            if(key === "player"){
                continue;
            }
            this[this.item_keys[i]].children.some((item)=>{
                let vx = -item.vx || 0;
                let vy = -item.vy || 0;
                item.x -= offset.vx + vx;
                item.y -= offset.vy + vy

                if(Object.prototype.toString.call(item.move) === "[object Function]"){
                    item.move();
                }
            });
        }
    }
});