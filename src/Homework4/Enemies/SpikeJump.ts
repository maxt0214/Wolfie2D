import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { EnemyStates } from "./EnemyController";
import EnemyState from "./EnemyState";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { HW4_Events } from "../hw4_enums";
import OnGround from "./OnGround";

export default class SpikeJump extends EnemyState {
    playerClose: boolean;
	onEnter(): void {
		(<AnimatedSprite>this.owner).animation.play("JUMP", true);
		(<AnimatedSprite>this.owner).tweens.play("jump", true);
        this.parent.velocity.y = -300;
		this.gravity = 500;
        this.playerClose = true;
	}
    handleInput(event: GameEvent) {
		if(event.type === HW4_Events.PLAYER_MOVE){
			let pos = event.data.get("position");
            //console.log((this.owner.position.x - pos.x) + "//" + (pos.x - this.owner.position.x) + "||" + (-16*10));
			if((this.owner.position.x > pos.x && this.owner.position.x - pos.x > (16*10)) || (this.owner.position.x < pos.x && this.owner.position.x - pos.x < (-16*10))){
				this.playerClose = false;
                console.log("SPIKE JUMP EXIT" + (this.owner.position.x - pos.x) + "//" + (pos.x - this.owner.position.x) + "||" + (-16*10));
			}
		}
	}
	update(deltaT: number): void {
		super.update(deltaT);
        //console.log(this.playerClose)
		if(this.owner.onGround){
            if (this.playerClose){
                this.finished(EnemyStates.SPIKEJUMP);
            }
			else{
                this.finished(EnemyStates.IDLE);
            }
		}

		if(this.owner.onCeiling){
			this.parent.velocity.y = 0;
		}

		this.parent.velocity.x += this.parent.direction.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		(<AnimatedSprite>this.owner).animation.stop();
		(<AnimatedSprite>this.owner).tweens.stop("jump");
		return {};
	}
}