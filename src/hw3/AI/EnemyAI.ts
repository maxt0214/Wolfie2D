import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Weapon from "../GameSystems/items/Weapon";
import { hw3_Events, hw3_Names } from "../hw3_constants";
import BattlerAI from "./BattlerAI";
import Alert from "./EnemyStates/Alert";
import Attack from "./EnemyStates/Attack";
import Guard from "./EnemyStates/Guard";
import Patrol from "./EnemyStates/Patrol";


export default class EnemyAI extends StateMachineGoapAI implements BattlerAI {
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 20;

    /** The weapon this AI has */
    weapon: Weapon;

    /** A reference to the player object */
    player1: GameNode;

    /** A reference to the player object */
    player2: GameNode;

    currentPlayer: GameNode;

    retreatPos: Vec2;

    inRange: number;

    goal: string;

    currentStatus: Array<string>;

    possibleActions: Array<GoapAction>;

    path: NavigationPath;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        if (options.defaultMode === "guard") {
            // Guard mode
            this.addState(EnemyStates.DEFAULT, new Guard(this, owner, options.guardPosition));
        } else {
            // Patrol mode
            this.addState(EnemyStates.DEFAULT, new Patrol(this, owner, options.patrolRoute));
        }

        this.addState(EnemyStates.ALERT, new Alert(this, owner));
        this.addState(EnemyStates.ATTACKING, new Attack(this, owner));

        this.health = options.health;

        this.weapon = options.weapon;

        this.player1 = options.player1;

        this.player2 = options.player2;

        this.currentPlayer = options.player1;

        this.inRange = options.inRange;

        this.goal = options.goal;

        this.currentStatus = options.status;

        this.possibleActions = options.actions;

        this.plan = new Stack<GoapAction>();

        this.planner = new GoapActionPlanner();

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);

        this.getPlayerPosition();
    }

    activate(options: Record<string, any>): void {
    }

    damage(damage: number): void {
        console.log("Took damage");
        this.health -= damage;

        if (this.health <= 2) {
            this.currentStatus.push("LOW_HEALTH");
            this.path = this.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, this.owner.position, this.retreatPos);
        }
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.weapon.assets.forEach(e => e.destroy())

            this.emitter.fireEvent("enemyDied", {enemy: this.owner})

            if (Math.random() < 0.2) {
                // Spawn a healthpack
                this.emitter.fireEvent("healthpack", { position: this.owner.position });
            }
        }
    }
    isPlayerVisible(pos: Vec2): Vec2{
        //Check if one player is visible, taking into account walls

        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);

        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);

        // Get the wall tilemap
        let walls = <OrthogonalTilemap>this.owner.getScene().getLayer("Wall").getItems()[0];

        let minIndex = walls.getColRowAt(new Vec2(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2(maxX, maxY));

        let tileSize = walls.getTileSize();

        for (let col = minIndex.x; col <= maxIndex.x; col++) {
            for (let row = minIndex.y; row <= maxIndex.y; row++) {
                if (walls.isTileCollidable(col, row)) {
                    // Get the position of this tile
                    let tilePos = new Vec2(col * tileSize.x + tileSize.x / 2, row * tileSize.y + tileSize.y / 2);

                    // Create a collider for this tile
                    let collider = new AABB(tilePos, tileSize.scaled(1 / 2));

                    let hit = collider.intersectSegment(start, delta, Vec2.ZERO);

                    if (hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)) {
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }

        return pos;
    }

    getPlayerPosition(): Vec2 {
        //Get the position of the closest player in sight
        let pos = this.player1.position;
        let position1 = this.isPlayerVisible(pos);
        
        pos = this.player2.position;
        let position2 = this.isPlayerVisible(pos);

        if (position1 == null && position2 == null){
            return null;
        }
        else if (position1 == null){
            this.currentPlayer = this.player2;
            this.retreatPos = new Vec2(position2.x + this.owner.position.x + 100, this.owner.position.y - position2.y - 100);
            return position2;
        }
        else if (position2 == null){
            this.currentPlayer = this.player1;
            this.retreatPos = new Vec2(position1.x + this.owner.position.x + 100, this.owner.position.y - position1.y - 100);
            return position1;
        }

        
        let distance1 = Math.sqrt(Math.pow(this.owner.position.x - position1.x, 2) + Math.pow(this.owner.position.y - position1.y, 2));
        let distance2 = Math.sqrt(Math.pow(this.owner.position.x - position2.x, 2) + Math.pow(this.owner.position.y - position2.y, 2));
        if (distance1 < distance2){
            this.currentPlayer = this.player1;
            this.retreatPos = new Vec2(position1.x + this.owner.position.x + 100, this.owner.position.y - position1.y - 100);
            return position1;
        }
        else{
            this.currentPlayer = this.player2;
            this.retreatPos = new Vec2(position2.x + this.owner.position.x + 100, this.owner.position.y - position2.y - 100);
            return position2;
        }
    }

    update(deltaT: number){
        super.update(deltaT);

        if (this.plan.isEmpty()) {
            //get a new plan
            this.plan = this.planner.plan("GOAL", this.possibleActions, this.currentStatus, null);
        }
    }
}

export enum EnemyStates {
    DEFAULT = "default",
    ALERT = "alert",
    ATTACKING = "attacking",
    PREVIOUS = "previous"
}