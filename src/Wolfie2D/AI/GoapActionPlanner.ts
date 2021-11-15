import Graph from "../DataTypes/Graphs/Graph";
import GoapAction from "../DataTypes/Interfaces/GoapAction";
import GoapAI from "../DataTypes/Interfaces/GoapAI";
import Queue from "../DataTypes/Queue";
import Stack from "../DataTypes/Stack";
import GraphUtils from "../Utils/GraphUtils";

export default class GoapActionPlanner {
    //TODO - Elaborate on all steps of planner more thoroughly
    mapping: Map<number,GoapAction | string>;
    graph: Graph;
    path: Array<number>;

    plan(goal: string, possibleActions: Array<GoapAction>, currentStatus: Array<string>, actor: GoapAI): Stack<GoapAction> {
        this.graph = new Graph(true);
        this.mapping = new Map();

        //0 is our root
        this.graph.addNode();
        this.mapping.set(0,"Start");
        //1 is the goal
        this.graph.addNode();
        this.mapping.set(1,"Goal");
        this.graph.addEdge(1,1,Number.POSITIVE_INFINITY);

        this.buildTree(0, goal, possibleActions, currentStatus);
        console.log(this.graph.toString());
        this.path = GraphUtils.djikstra(this.graph, 0);
        //console.log(this.path.toString())

        let plan = new Stack<GoapAction>();
		
		// Push the final position and the final position in the graph
		//plan.push(this.mapping.get(1));

		// Add all parents along the path
		let i = 1;
		while(this.path[i] !== -1){
            console.log(this.path[i]);
            if (this.path[i] !== 0){
			    plan.push(<GoapAction>this.mapping.get(this.path[i]));
            }
			i = this.path[i];
		}
        
        return plan;
    }

    buildTree(root: number, goal:string, possibleActions: Array<GoapAction>, currentStatus: Array<string>): void {
        //build a hastable to link indicies of the graph to what the action is, 
        //check on the side how getEdges works, hastable will use Actions as the identifier, 
        //build the tree then run dijstras from root state, will have shortest path to goal if it exists.
        
        possibleActions.forEach(action => {
            console.log("root:" + root + ",action precons:" + action.preconditions.toString() 
                + ", action effects:" + action.effects.toString() + ", current Status:" + currentStatus.toString())
            if (action.checkPreconditions(currentStatus)){
                //This action can be performed
                //Add effects to currentStatus
                let newStatus = [...currentStatus];
                newStatus.push(...action.effects);

                //Check if the new node is the goal
                if (newStatus.includes(goal)){
                    console.log("AT GOAL");
                    let newNode = this.graph.addNode() - 1;
                    this.mapping.set(newNode, action);
                    this.graph.addEdge(root, newNode, action.cost);
                    this.graph.addEdge(newNode, 1, 0);
                    return;
                }

                //Add node and edge from root
                let newNode = this.graph.addNode() - 1;
                this.mapping.set(newNode, action);
                this.graph.addEdge(root, newNode, action.cost);
                
                //Recursive call
                console.log(possibleActions.indexOf(action))
                let newActions = possibleActions.filter(act => act !== action)
                console.log(possibleActions);
                console.log(newActions);
                this.buildTree(newNode, goal, newActions, action.effects);
            }
        });
    }
}