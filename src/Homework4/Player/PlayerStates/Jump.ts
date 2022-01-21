import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { HW4_Color } from "../../hw4_color";
import { HW4_Events } from "../../hw4_enums";
import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";

export default class Jump extends InAir {
	owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		if (this.parent.suitColor == HW4_Color.RED){ 
			this.owner.animation.play("RED_JUMP", true);
		}
		else if (this.parent.suitColor == HW4_Color.GREEN){
			this.owner.animation.play("GREEN_JUMP", true);
		}
		else if (this.parent.suitColor == HW4_Color.BLUE){
			this.owner.animation.play("BLUE_JUMP", true);
		}
		//this.owner.animation.play("JUMP", true);
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "jump", loop: false, holdReference: false});
	}

	update(deltaT: number): void {
		super.update(deltaT);

		if(this.owner.onCeiling){
			this.parent.velocity.y = 0;
		}

		// If we're falling, go to the fall state
		if(this.parent.velocity.y >= 0){
			this.finished(PlayerStates.FALL);
		}
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}