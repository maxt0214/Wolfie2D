import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { hw3_Names } from "../../hw3_constants";
import EnemyAI from "../EnemyAI";

export default class Retreat implements GoapAction {
    cost: number;
    preconditions: Array<string>;
    effects: Array<string>;
    loopAction: boolean;

    private path: NavigationPath;
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        this.cost = cost;
        this.preconditions = preconditions;
        this.loopAction = true;
        this.effects = effects;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            let enemy = <EnemyAI>actor;
            if (enemy.owner.position.x > enemy.retreatPos.x && enemy.owner.position.y > enemy.retreatPos.y){
                return this.effects;
            }
            console.log("RETREAT")
            this.path = enemy.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, enemy.owner.position, enemy.retreatPos);
            enemy.owner.moveOnPath(enemy.speed * deltaT, this.path);

            return null;
        }
        return this.effects;
    }

    checkPreconditions(statuses: Array<string>): boolean {
        //if (statuses.length <= this.preconditions.length) {
            // Check that every element in the preconditions array is found in the statuses array
            return (this.preconditions.every((status) => {
                if (!statuses.includes(status)){
                    return false;
                }
                return true;
            }));
            return true;
        //}
        return false;
    }

    addPrecondition(preconditions: string | string[]): void {
        this.preconditions.push(...preconditions);
    }

    addEffect(effects: string | string[]): void {
        this.effects.push(...effects);
    }

    removePrecondition(precondition: string): boolean {
        throw new Error("Method not implemented.");
    }
    removeEffect(effect: string): boolean {
        throw new Error("Method not implemented.");
    }

    updateCost(options: Record<string, number>): void {
        //For example, lets say the options send in a unit's attack damage, higher attack damage lowers the cost to incentive using the move more
        if (options.attack > 10) {
            this.cost-=3;
        }
        else if (options.attack < 3){
            this.cost+=3;
        }
        //Leave default if in between range of 3 and 10

    }
    toString(): string{
        return "ACTION PRECON: " + this.preconditions.toString() + ", ACTION EFFECTS: " + this.effects.toString() + ", ACTION COST: " + this.cost;
    }
    
}