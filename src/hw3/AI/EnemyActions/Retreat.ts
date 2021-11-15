import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { hw3_Names } from "../../hw3_constants";
import EnemyAI from "../EnemyAI";

//TODO elaborate a bit more on actions
export default class Retreat extends GoapAction {
    private path: NavigationPath;
    protected emitter: Emitter;

    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.loopAction = true;
        this.effects = effects;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)) {
            let enemy = <EnemyAI>actor;
            if (enemy.owner.position.x > enemy.retreatPos.x && enemy.owner.position.y > enemy.retreatPos.y) {
                return this.effects;
            }
            this.path = enemy.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, enemy.owner.position, enemy.retreatPos);
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