import Input from "../../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { HW4_Color } from "../../hw4_color";
import { PlayerStates } from "../PlayerController";
import OnGround from "./OnGround";

export default class Idle extends OnGround {
	owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		this.parent.speed = this.parent.MIN_SPEED;
		if (this.parent.suitColor == HW4_Color.RED){ 
			this.owner.animation.play("RED_IDLE", true);
		}
		else if (this.parent.suitColor == HW4_Color.GREEN){
			this.owner.animation.play("GREEN_IDLE", true);
		}
		else if (this.parent.suitColor == HW4_Color.BLUE){
			this.owner.animation.play("BLUE_IDLE", true);
		}
		//this.owner.animation.play("IDLE", true);
	}

	update(deltaT: number): void {
		super.update(deltaT);

		let dir = this.getInputDirection();

		if(!dir.isZero() && dir.y === 0){
			if(Input.isPressed("run")){
				this.finished(PlayerStates.RUN);
			} else {
				this.finished(PlayerStates.WALK);
			}
		}
		
		this.parent.velocity.x = 0;

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}