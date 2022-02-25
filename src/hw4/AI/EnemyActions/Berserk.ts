import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import EnemyAI from "../EnemyAI";

// HOMEWORK 4 - TODO
export default class Berserk extends GoapAction {
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        return null;
    }

    updateCost(options: Record<string, number>): void {}
    
    toString(): string {
        return "(Berserk)";
    }
    
}