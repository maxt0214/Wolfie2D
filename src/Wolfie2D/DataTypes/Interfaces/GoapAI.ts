import GoapActionPlanner from "../../AI/GoapActionPlanner";
import GameEvent from "../../Events/GameEvent";
import GameNode from "../../Nodes/GameNode";
import Queue from "../Queue";
import Stack from "../Stack";
import GoapAction from "./GoapAction";
import Updateable from "./Updateable";

/**
 * Defines a controller for a bot or a human. Must be able to update
 */
export default interface GoapAI extends Updateable {
    /** TODO: Implement some of these? Clarify method names and calling for controllor, 
     * aka have a method to handle dedicated GOAP functionalit
     * y and initlaization and one that is manually implemented */
    goal: string;

    currentStatus: Array<string>;

    possibleActions: Array<GoapAction>;

    plan: Stack<GoapAction>;
    
    planner: GoapActionPlanner;

    /** Clears references from to the owner */
    destroy(): void;

    /** Activates this AI from a stopped state and allows variables to be passed in */
    activate(options: Record<string, any>): void;

    /** Handles events from the Actor */
    handleEvent(event: GameEvent): void;

    //initializeAI(owner:GameNode, goal:string, status:Array<string>, actions: Array<GoapAction>): void

    initializeAI(owner:GameNode, options: Record<string, any>): void

    changeGoal(goal: string): void

    addStatus(status: string): void
}