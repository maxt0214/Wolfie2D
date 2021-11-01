import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import EnemyAI from "../EnemyAI";

export default class AttackAction implements GoapAction {
    cost: number;
    preconditions: Array<string>;
    effects: Array<string>;
    loopAction: boolean;
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        if (this.checkPreconditions(statuses)){
            let enemy = <EnemyAI>actor;

            let dir = enemy.getPlayerPosition().clone().sub(enemy.owner.position).normalize();
            dir.rotateCCW(Math.PI / 4 * Math.random() - Math.PI/8);
            if(enemy.weapon.use(enemy.owner, "enemy", dir)){
                // If we fired, face that direction
                enemy.owner.rotation = Vec2.UP.angleToCCW(dir);
            }
            return this.effects;
        }
        return null;
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