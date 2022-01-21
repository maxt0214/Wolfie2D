import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { HW4_Color } from "../../hw4_color";
import InAir from "./InAir";

export default class Fall extends InAir {
    owner: AnimatedSprite;

	onEnter(options: Record<string, any>): void {
		if (this.parent.suitColor == HW4_Color.RED){ 
			this.owner.animation.play("RED_FALL", true);
		}
		else if (this.parent.suitColor == HW4_Color.GREEN){
			this.owner.animation.play("GREEN_FALL", true);
		}
		else if (this.parent.suitColor == HW4_Color.BLUE){
			this.owner.animation.play("BLUE_FALL", true);
		}
		//this.owner.animation.play("FALL", true);
	}

    onExit(): Record<string, any> {
		this.owner.animation.stop();
        return {};
    }
}