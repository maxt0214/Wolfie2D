import GoapAction from "../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Emitter from "../Wolfie2D/Events/Emitter";
import GameNode from "../Wolfie2D/Nodes/GameNode";

export default class GoapActionExample implements GoapAction {
    cost: number;
    preconditions: Array<string>;
    effects: Array<string>;
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>) {
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
    }

    performAction(statuses: Array<string>, actor: GameNode, target?: GameNode): Array<string> {
        if (this.checkPreconditions(statuses)){
            this.emitter.fireEvent("Attack", {actor: actor.id, target: target.id});
            return this.effects;
        }
        return null;
    }

    checkPreconditions(statuses: Array<string>): boolean {
        if (statuses.length === this.preconditions.length) {
            // Check that every element in the preconditions array is found in the statuses array
            return this.preconditions.every((status) => {
                return statuses.includes(status);
            });
        }
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