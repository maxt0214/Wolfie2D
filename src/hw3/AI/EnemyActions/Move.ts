import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import EnemyAI from "../EnemyAI";

//TODO elaborate a bit more on actions
export default class Move extends GoapAction {
    private inRange: number;

    private path: NavigationPath;
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
        this.loopAction = true;
        this.inRange = options.inRange;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            let enemy = <EnemyAI>actor;
            let playerPos = enemy.currentPlayer.position;
            let distance = enemy.owner.position.distanceTo(playerPos);
            if (distance <= this.inRange){
                return this.effects;
            }
            this.path = enemy.path;
            enemy.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(enemy.owner));
            enemy.owner.moveOnPath(enemy.speed * deltaT, this.path);
            return null;
        }
        return this.effects;
    }

    updateCost(options: Record<string, number>): void {}

    toString(): string {
        return "ACTION PRECON: " + this.preconditions.toString() + ", ACTION EFFECTS: " + this.effects.toString() + ", ACTION COST: " + this.cost;
    }
    
}