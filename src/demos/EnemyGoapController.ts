import GoapActionPlanner from "../Wolfie2D/AI/GoapActionPlanner";
import StateMachineGoapAI from "../Wolfie2D/AI/StateMachineGoapAI";
import Queue from "../Wolfie2D/DataTypes/Queue";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameNode from "../Wolfie2D/Nodes/GameNode";

export default class EnemyGoapController extends StateMachineGoapAI {
    owner: GameNode;
	direction: Vec2 = Vec2.ZERO;
	velocity: Vec2 = Vec2.ZERO;
	speed: number = 200;

	initializeAI(owner: GameNode, options: Record<string, any>){
		this.owner = owner;

        this.goal = options.goal;

        this.currentStatus = options.currentStatus;

        this.possibleActions = options.possibleActions;
    
        this.plan = new Queue();
        
        this.planner = new GoapActionPlanner();

        /*//Idle State looks for a new plan
		let idle = new Idle(this, owner);
		this.addState("IDLE", idle);

        //Action State executes a queue of given plans
		let walk = new Action(this, owner);
		this.addState("ACTION", walk);*/

        this.initialize("IDLE");
	}

	changeState(stateName: string): void {
        super.changeState(stateName);
	}

	update(deltaT: number): void {
		super.update(deltaT);
	}
}