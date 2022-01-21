import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import { HW4_Color } from "../hw4_color";
import GameLevel from "./GameLevel";
import Level2 from "./Level2";

export default class Level1 extends GameLevel {
    
    loadScene(): void {
        // Load resources
        this.load.image("background", "hw4_assets/sprites/2bitbackground.png");
        this.load.image("coin", "hw4_assets/sprites/coin.png");
        this.load.tilemap("level1", "hw4_assets/tilemaps/level3.json");
        this.load.spritesheet("player", "hw4_assets/spritesheets/spike.json");
        this.load.spritesheet("hopper", "hw4_assets/spritesheets/greenBalloon.json");
        this.load.spritesheet("bunny", "hw4_assets/spritesheets/redBalloon.json");
        this.load.spritesheet("blue", "hw4_assets/spritesheets/blueBalloon.json");
        this.load.audio("jump", "hw4_assets/sounds/jump.wav");
        this.load.audio("coin", "hw4_assets/sounds/coin.wav");
        this.load.audio("player_death", "hw4_assets/sounds/player_death.wav");
        this.load.audio("ghost_death", "hw4_assets/sounds/ghost_death.wav");
        this.load.audio("heli_death", "hw4_assets/sounds/heli_death.wav");
        this.load.audio("level_music", "hw4_assets/music/level_music.mp3");
    }

    // HOMEWORK 4 - TODO
    /**
     * Decide which resource to keep and which to cull.
     * 
     * Check out the resource manager class.
     * 
     * Figure out how to save resources from being unloaded, and save the ones that are needed
     * for level 2.
     * 
     * This will let us cut down on load time for the game (although there is admittedly
     * not a lot of load time for such a small project).
     */
    unloadScene(){
        // Keep resources - this is up to you
        this.load.keepImage("background");
        this.load.keepImage("coin");
        this.load.keepSpritesheet("player");
        this.load.keepSpritesheet("hopper");
        this.load.keepSpritesheet("bunny");
        this.load.keepAudio("jump");
        this.load.keepAudio("coin");
        this.load.keepAudio("player_death");
        this.load.keepAudio("ghost_death");
        this.load.keepAudio("heli_death");
        this.load.keepAudio("level_music");
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level_music"});
    }

    startScene(): void {
        // Add a background layer and set the background image on it
        this.addParallaxLayer("bg", new Vec2(0.25, 0), -100);
        let bg = this.add.sprite("background", "bg");
        bg.scale.set(2, 2);
        bg.position.set(bg.boundary.halfSize.x, 76);

        // Add the level 1 tilemap
        this.add.tilemap("level1", new Vec2(2, 2));
        this.viewport.setBounds(0, 0, 64*32, 20*32);

        this.playerSpawn = new Vec2(5*32, 14*32);

        // Do generic setup for a GameLevel
        super.startScene();

        this.addLevelEnd(new Vec2(58, 17), new Vec2(2, 2));

        this.nextLevel = Level2;

        // Add enemies of various types
        for(let pos of [new Vec2(24, 12)]){
            this.addEnemy("bunny", pos, {color: HW4_Color.RED});
        }

        for(let pos of [new Vec2(51, 13)]){
            this.addEnemy("hopper", pos, {color: HW4_Color.GREEN});
        }

        for(let pos of [new Vec2(36, 13)]){
            this.addEnemy("blue", pos, {color: HW4_Color.BLUE});
        }
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);

        Debug.log("playerpos", this.player.position.toString());
    }
}