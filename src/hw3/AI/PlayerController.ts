import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../Wolfie2D/Timing/Timer";
import InventoryManager from "../GameSystems/InventoryManager";
import Healthpack from "../GameSystems/items/Healthpack";
import Item from "../GameSystems/items/Item";
import Weapon from "../GameSystems/items/Weapon";
import { hw3_Names } from "../hw3_constants";
import BattlerAI from "./BattlerAI";


export default class PlayerController implements BattlerAI {
    // Fields from BattlerAI
    health: number;

    // The actual player sprite
    owner: AnimatedSprite;

    range: number;

    target: Vec2;

    inputEnabled: boolean;

    // The inventory of the player
    inventory: InventoryManager;

    /** A list of items in the game world */
    private items: Array<Item>;

    // Movement
    private direction: Vec2;
    private speed: number;

    // Attacking
    private lookDirection: Vec2;
    private path: NavigationPath;


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.direction = Vec2.ZERO;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = 1000;
        this.inputEnabled = options.inputEnabled;
        this.range = options.range;

        this.items = options.items;
        this.inventory = options.inventory;
    }

    activate(options: Record<string, any>): void { }

    handleEvent(event: GameEvent): void { }

    update(deltaT: number): void {
        if (this.inputEnabled) {
            //Check right click
            if (Input.isMouseJustPressed(2)) {
                this.path = this.owner.getScene().getNavigationManager().getPath(hw3_Names.NAVMESH, this.owner.position, Input.getGlobalMousePosition(), true);
                console.log(Input.getMousePosition())
                console.log(this.owner.position)
            }

            // Check for slot change
            if (Input.isJustPressed("slot1")) {
                this.inventory.changeSlot(0);
            } else if (Input.isJustPressed("slot2")) {
                this.inventory.changeSlot(1);
            }

            if (Input.isJustPressed("pickup")) {
                // Check if there is an item to pick up
                for (let item of this.items) {
                    if (this.owner.collisionShape.overlaps(item.sprite.boundary)) {
                        // We overlap it, try to pick it up
                        this.inventory.addItem(item);
                        break;
                    }
                }
            }

            if (Input.isJustPressed("drop")) {
                // Check if we can drop our current item
                let item = this.inventory.removeItem();

                if (item) {
                    // Move the item from the ui to the gameworld
                    item.moveSprite(this.owner.position, "primary");

                    // Add the item to the list of items
                    this.items.push(item);
                }
            }
        }

        //Move on path if selected
        if (this.path != null) {
            if (this.path.isDone()) {
                this.path = null;
                console.log("PATH IS DONE")
            }
            else {
                this.owner.moveOnPath(this.speed * deltaT, this.path);
                this.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(this.owner));
            }
        }
        else {
            //Target an enemy and attack
            if (this.target != null) {
                let item = this.inventory.getItem();
                this.lookDirection = this.owner.position.dirTo(this.target);

                // If there is an item in the current slot, use it
                if (item) {
                    item.use(this.owner, "player", this.lookDirection);
                    this.owner.rotation = Vec2.UP.angleToCCW(this.lookDirection);

                    if (item instanceof Healthpack) {
                        // Destroy the used healthpack
                        this.inventory.removeItem();
                        item.sprite.visible = false;
                    }
                }
            }
        }
    }

    damage(damage: number): void {
        this.health -= damage;

        if (this.health <= 0) {
            console.log("Game Over");
        }
    }

    destroy() {

    }
}