import StateMachineGoapAI from "../../AI/StateMachineGoapAI";
import GameNode from "../../Nodes/GameNode";

export default interface GoapAction {
    /** Cost it takes to complete this action */
    cost: number;

    /** Preconditions that have to be satisfied for an action to happen */
    preconditions: Array<string>;

    /** Resulting statuses after this action completes */
    effects: Array<string>;

    loopAction: boolean;

    /** Initalize action specifications */
    //initializeAction(cost: number, preconditions: Array<string>, effects: Array<string>): void;

    /**
     * Attempt to perform an action, if successful, it will return an array of the expected effects, otherwise it will return null
     * @param statuses Current statuses of the actor
     * @param actor GameNode for the actor
     * @param target GameNode for a optional target
     */
    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string>;

    /** Check preconditions with current statuses to see if action can be performed */
    checkPreconditions(statuses: Array<string>): boolean;

    /** Add one or more preconditions to this action */
    addPrecondition(preconditions: string | string[]): void;

    /** Add one or more effects to this action */
    addEffect(effects: string | string[]): void;

    /** Removes an precondition, returns true if successful */
    removePrecondition(precondition: string): boolean;
    
    /** Removes an precondition, returns true if successful */
    removeEffect(effect: string): boolean;

    /** Update the cost of this action based on options */
    updateCost(options: Record<string,number>): void;

    toString(): string;

}