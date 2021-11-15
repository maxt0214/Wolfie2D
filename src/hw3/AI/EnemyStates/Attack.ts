import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { hw3_Names } from "../../hw3_constants";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";

//TODO probably rename this class and fix it up, add comments, etc.
export default class Attack extends EnemyState {
    // Timers for managing this state
    pollTimer: Timer;
    exitTimer: Timer;
    alertTimer: Timer;

    // The current known position of the player
    playerPos: Vec2;

    // The last known position of the player
    lastPlayerPos: Vec2;

    // The return object for this state
    retObj: Record<string, any>;

    constructor(parent: EnemyAI, owner: GameNode) {
        super(parent, owner);

        // Regularly update the player location
        this.pollTimer = new Timer(100);

        this.exitTimer = new Timer(1000);

        this.alertTimer = new Timer(10000);
    }

    onEnter(options: Record<string, any>): void {
        this.lastPlayerPos = this.parent.getPlayerPosition();

        // Reset the return object
        this.retObj = {};

        this.alertTimer.start();
        this.parent.path = this.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, this.owner.position, this.lastPlayerPos, true);
    }

    handleInput(event: GameEvent): void { }

    update(deltaT: number): void {
        /*if(this.pollTimer.isStopped()){
            // Restart the timer
            this.pollTimer.start();

            this.playerPos = this.parent.getPlayerPosition();

            if(this.playerPos !== null){
                // If we see a new player position, update the last position
                this.lastPlayerPos = this.playerPos;
                console.log("LAST POSITION");
                console.log(this.lastPlayerPos.toString());
            }
        }

        if(this.playerPos !== null){
            // Player is visible, restart the exitTimer
            this.exitTimer.start();

            // Fire at player
            let dir = this.playerPos.clone().sub(this.owner.position).normalize();
            dir.rotateCCW(Math.PI / 4 * Math.random() - Math.PI/8);
            if(this.parent.weapon.use(this.owner, "enemy", dir)){
                // If we fired, face that direction
                this.owner.rotation = Vec2.UP.angleToCCW(dir);
            }

        }

        if(this.exitTimer.isStopped()){
            // We haven't seen the player in a while, go check out where we last saw them, if possible
            if(this.lastPlayerPos !== null){
                this.retObj = {target: this.lastPlayerPos}
                this.finished(EnemyStates.ALERT);
            } else {
                this.finished(EnemyStates.DEFAULT);
            }
        }*/
        if (this.pollTimer.isStopped()) {
            // Restart the timer
            this.pollTimer.start();

            this.playerPos = this.parent.getPlayerPosition();

            if (this.playerPos !== null) {
                // If we see a new player position, update the last position
                this.parent.path = this.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, this.owner.position, this.lastPlayerPos, true);
                this.lastPlayerPos = this.playerPos;
                this.exitTimer.start();
            }
        }

        if (this.exitTimer.isStopped()) {
            // We haven't seen the player in a while, go check out where we last saw them, if possible
            if (this.lastPlayerPos !== null) {
                this.retObj = { target: this.lastPlayerPos }
                this.finished(EnemyStates.ALERT);
            } else {
                this.finished(EnemyStates.DEFAULT);
            }
        }

        if (this.alertTimer.isStopped()) {
            // The timer is up, return to the default state
            this.alertTimer.start();
            //this.parent.path = this.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, this.owner.position, this.lastPlayerPos, true);
        }

        if (this.playerPos !== null) {
            let distance = this.owner.position.distanceTo(this.playerPos);
            if (distance > this.parent.inRange) {
                console.log("NOT IN RANGE");
                let index = this.parent.currentStatus.indexOf("IN_RANGE");
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                    console.log("NOT IN RANGE");
                }
            }
        }

        let nextAction = this.parent.plan.peek();
        let result = nextAction.performAction(this.parent.currentStatus, this.parent, deltaT);
        if (result !== null) {
            //action was successful
            if (result.includes("GOAL")) {
                //this.parent.currentStatus = [];
                //this.parent.currentStatus.slice()
            }
            else {
                this.parent.currentStatus = this.parent.currentStatus.concat(...result);
            }
            this.parent.plan.pop();
        }
        else {
            if (!nextAction.loopAction) {
                this.parent.plan.pop();
            }
        }

    }

    onExit(): Record<string, any> {
        return this.retObj;
    }

}