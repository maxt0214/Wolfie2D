import PlayerController from "../AI/PlayerController";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import {hw4_Events, hw4_Names, hw4_Statuses} from "../hw4_constants";
import EnemyAI from "../AI/EnemyAI";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../Wolfie2D/Registry/RegistryManager";
import Weapon from "../GameSystems/items/Weapon";
import Healthpack from "../GameSystems/items/Healthpack";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import BattleManager from "../GameSystems/BattleManager";
import BattlerAI from "../AI/BattlerAI";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import Input from "../../Wolfie2D/Input/Input";
import GameOver from "./GameOver";
import AttackAction from "../AI/EnemyActions/AttackAction";
import Move from "../AI/EnemyActions/Move";
import Retreat from "../AI/EnemyActions/Retreat";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import Map from "../../Wolfie2D/DataTypes/Map";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import Berserk from "../AI/EnemyActions/Berserk";


export default class hw4_scene extends Scene {
    // The player
    private playerCharacters: Array<AnimatedSprite>;

    // A list of enemies
    private enemies: Array<AnimatedSprite>;

    // The wall layer of the tilemap to use for bullet visualization
    private walls: OrthogonalTilemap;

    // The position graph for the navmesh
    private graph: PositionGraph;

    // A list of items in the scene
    private items: Array<Item>;

    // The battle manager for the scene
    private battleManager: BattleManager;

    // Player health
    private healthDisplays: Array<Label>;

    loadScene(){
        // Load the player and enemy spritesheets
        this.load.spritesheet("player1", "hw4_assets/spritesheets/player1.json");
        this.load.spritesheet("player2", "hw4_assets/spritesheets/player2.json");

        this.load.spritesheet("gun_enemy", "hw4_assets/spritesheets/gun_enemy.json");
        this.load.spritesheet("knife_enemy", "hw4_assets/spritesheets/knife_enemy.json");
        this.load.spritesheet("custom_enemy1", "hw4_assets/spritesheets/custom_enemy1.json");
        this.load.spritesheet("custom_enemy2", "hw4_assets/spritesheets/custom_enemy2.json");

        this.load.spritesheet("slice", "hw4_assets/spritesheets/slice.json");

        // Load the tilemap
        // HOMEWORK 4 - TODO
        // Change this file to be your own tilemap
        this.load.tilemap("level", "hw4_assets/tilemaps/cse380_hw4_tilejson.json");

        // Load the scene info
        this.load.object("weaponData", "hw4_assets/data/weaponData.json");

        // Load the nav mesh
        this.load.object("navmesh", "hw4_assets/data/navmesh.json");

        // Load in the enemy info
        this.load.object("enemyData", "hw4_assets/data/enemy.json");

        // Load in item info
        this.load.object("itemData", "hw4_assets/data/items.json");

        // Load the healthpack sprite
        this.load.image("healthpack", "hw4_assets/sprites/healthpack.png");
        this.load.image("inventorySlot", "hw4_assets/sprites/inventory.png");
        this.load.image("knife", "hw4_assets/sprites/knife.png");
        this.load.image("laserGun", "hw4_assets/sprites/laserGun.png");
        this.load.image("pistol", "hw4_assets/sprites/pistol.png");
        
    }

    startScene(){
        // Add in the tilemap
        let tilemapLayers = this.add.tilemap("level");

        // Get the wall layer
        // HOMEWORK 4 - TODO
        /*
            Modify this line if needed.
            
            This line is just getting the wall layer of your tilemap to use for some calculations.
            Make sure it is still doing so.

            What the line is saying is to get the first level from the bottom (tilemapLayers[1]),
            which in my case was the Walls layer.
        */
        this.walls = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        // Set the viewport bounds to the tilemap
        let tilemapSize: Vec2 = this.walls.size; 
        this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);

        this.addLayer("primary", 10);

        // Create the battle manager
        this.battleManager = new BattleManager();

        this.initializeWeapons();

        // Initialize the items array - this represents items that are in the game world
        this.items = new Array();

        // Create the player
        this.initializePlayer();

        // Make the viewport follow the player
        this.viewport.follow(this.playerCharacters[0]);

        // Zoom in to a reasonable level
        this.viewport.enableZoom();
        this.viewport.setZoomLevel(4);

        // Create the navmesh
        this.createNavmesh();

        // Initialize all enemies
        this.initializeEnemies();

        // Send the player and enemies to the battle manager
        this.battleManager.setPlayers([<BattlerAI>this.playerCharacters[0]._ai, <BattlerAI>this.playerCharacters[1]._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        // Subscribe to relevant events
        this.receiver.subscribe("healthpack");
        this.receiver.subscribe("enemyDied");
        this.receiver.subscribe(hw4_Events.UNLOAD_ASSET);

        // Spawn items into the world
        this.spawnItems();

        // Add a UI for health
        this.addUILayer("health");

        this.healthDisplays = new Array(2);
        this.healthDisplays[0] = <Label>this.add.uiElement(UIElementType.LABEL, "health", {position: new Vec2(70, 16), text: "Health: " + (<BattlerAI>this.playerCharacters[0]._ai).health});
        this.healthDisplays[0].textColor = Color.WHITE;

        this.healthDisplays[1] = <Label>this.add.uiElement(UIElementType.LABEL, "health", {position: new Vec2(70, 32), text: "Health: " + (<BattlerAI>this.playerCharacters[1]._ai).health});
        this.healthDisplays[1].textColor = Color.WHITE;
    }

    updateScene(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();

            if(event.isType("healthpack")){
                this.createHealthpack(event.data.get("position"));
            }
            if(event.isType("enemyDied")){
                this.enemies = this.enemies.filter(enemy => enemy !== event.data.get("enemy"));
                this.battleManager.enemies = this.battleManager.enemies.filter(enemy => enemy !== <BattlerAI>(event.data.get("enemy")._ai));
            }
            if(event.isType(hw4_Events.UNLOAD_ASSET)){
                console.log(event.data);
                let asset = this.sceneGraph.getNode(event.data.get("node"));

                asset.destroy();
            }
        }

        // check health of each player
        let health1 = (<BattlerAI>this.playerCharacters[0]._ai).health;
        let health2 = (<BattlerAI>this.playerCharacters[1]._ai).health;

        //If both are dead, game over
        if(health1 === 0 || health2 === 0){
            this.sceneManager.changeToScene(GameOver);
        }

        // update closest enemy of each player
        let closetEnemy1 = this.getClosestEnemy(this.playerCharacters[0].position, (<PlayerController>this.playerCharacters[0]._ai).range);
        let closetEnemy2 = this.getClosestEnemy(this.playerCharacters[1].position, (<PlayerController>this.playerCharacters[1]._ai).range);

        (<PlayerController>this.playerCharacters[0]._ai).target = closetEnemy1;
        (<PlayerController>this.playerCharacters[1]._ai).target = closetEnemy2;

        // Update health gui
        this.healthDisplays[0].text = "Health: " + health1;
        this.healthDisplays[1].text = "Health: " + health2;

        // Debug mode graph
        if(Input.isKeyJustPressed("g")){
            this.getLayer("graph").setHidden(!this.getLayer("graph").isHidden());
        }
        
        //Swap characters
        if(Input.isKeyJustPressed("z")){
            this.emitter.fireEvent(hw4_Events.SWAP_PLAYER, {id: this.playerCharacters[0].id});
            this.viewport.follow(this.playerCharacters[0]);
        }

        if(Input.isKeyJustPressed("x")){
            this.emitter.fireEvent(hw4_Events.SWAP_PLAYER, {id: this.playerCharacters[1].id});
            this.viewport.follow(this.playerCharacters[1]);
        }
    }

    getClosestEnemy(playerPos: Vec2, range: number): Vec2 {
        let closetDistance: number = Number.POSITIVE_INFINITY;
        let closetEnemy: Vec2 = null;
        for (let enemy of this.enemies){
            let distance = Math.sqrt(Math.pow(enemy.position.x - playerPos.x, 2) + Math.pow(enemy.position.y - playerPos.y, 2));
            if (distance <= range){
                if (distance < closetDistance){
                    closetDistance = distance;
                    closetEnemy = enemy.position;
                }
            }
        }
        return closetEnemy;
    }

    // HOMEWORK 4 - TODO
    /**
     * This function spawns in all of the items in "items.json"
     * 
     * You shouldn't have to put any new code here, however, you will have to modify items.json.
     * 
     * Make sure you are spawning in 5 pistols and 5 laser guns somewhere (accessible) in your world.
     * 
     * You'll notice that right now, some healthpacks are also spawning in. These also drop from guards.
     * Feel free to spawn some healthpacks if you want, or you can just let the player suffer >:)
     */
    spawnItems(): void {
        // Get the item data
        let itemData = this.load.getObject("itemData");

        for(let item of itemData.items){
            if(item.type === "healthpack"){
                // Create a healthpack
                this.createHealthpack(new Vec2(item.position[0], item.position[1]));
            } else {
                let weapon = this.createWeapon(item.weaponType);
                weapon.moveSprite(new Vec2(item.position[0], item.position[1]));
                this.items.push(weapon);
            }
        }        
    }

    /**
     * 
     * Creates and returns a new weapon
     * @param type The weaponType of the weapon, as a string
     */
    createWeapon(type: string): Weapon {
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);

        let sprite = this.add.sprite(weaponType.spriteKey, "primary");

        return new Weapon(sprite, weaponType, this.battleManager);
    }

    /**
     * Creates a healthpack at a certain position in the world
     * @param position 
     */
    createHealthpack(position: Vec2): void {
        let sprite = this.add.sprite("healthpack", "primary");
        let healthpack = new Healthpack(sprite)
        healthpack.moveSprite(position);
        this.items.push(healthpack);
    }

    /**
     * Initalizes all weapon types based of data from weaponData.json
     */
    initializeWeapons(): void{
        let weaponData = this.load.getObject("weaponData");

        for(let i = 0; i < weaponData.numWeapons; i++){
            let weapon = weaponData.weapons[i];

            // Get the constructor of the prototype
            let constr = RegistryManager.getRegistry("weaponTemplates").get(weapon.weaponType);

            // Create a weapon type
            let weaponType = new constr();

            // Initialize the weapon type
            weaponType.initialize(weapon);

            // Register the weapon type
            RegistryManager.getRegistry("weaponTypes").registerItem(weapon.name, weaponType)
        }
    }

    initializePlayer(): void {
        // Create the inventory
        let inventory = new InventoryManager(this, 2, "inventorySlot", new Vec2(16, 16), 4, "slots1", "items1");
        let startingWeapon = this.createWeapon("knife");
        inventory.addItem(startingWeapon);

        // Create the players
        this.playerCharacters = Array(2);
        this.playerCharacters[0] = this.add.animatedSprite("player1", "primary");
        this.playerCharacters[0].position.set(4*16, 62*16);
        this.playerCharacters[0].addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));
        //First player is melee based, starts off with a knife and is short ranged
        this.playerCharacters[0].addAI(PlayerController,
            {
                speed: 100,
                health: 100,
                inventory: inventory,
                items: this.items,
                inputEnabled: true,
                range: 30
            });
        this.playerCharacters[0].animation.play("IDLE");


        inventory = new InventoryManager(this, 2, "inventorySlot", new Vec2(16, 32), 4, "slots2", "items2");
        startingWeapon = this.createWeapon("weak_pistol");
        inventory.addItem(startingWeapon);

        //Second player is ranged based, long range and starts with pistol
        this.playerCharacters[1] = this.add.animatedSprite("player2", "primary");
        this.playerCharacters[1].position.set(2*16, 62*16);
        this.playerCharacters[1].addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));
        this.playerCharacters[1].addAI(PlayerController,
            {
                speed: 100,
                health: 100,
                inventory: inventory,
                items: this.items,
                inputEnabled: false,
                range: 100
            });
        this.playerCharacters[1].animation.play("IDLE");

        //Set inventory UI highlight
        (<PlayerController>this.playerCharacters[0]._ai).inventory.setActive(true);
        (<PlayerController>this.playerCharacters[1]._ai).inventory.setActive(false);
    }

    /**
     * This function creates the navmesh for the game world.
     * 
     * It reads in information in the navmesh.json file.
     * The format of the navmesh.json file is as follows
     * 
     * {
     *  // An array of positions on the tilemap. You can see the position of your mouse in [row, col]
     *  // while editing a map in Tiled, and can just multiply those values by the tile size, 16x16
     *      "nodes": [[100, 200], [50, 400], ...]
     * 
     *  // An array of edges between nodes. The numbers here correspond to indices in the "nodes" array above.
     *  // Note that edges are not directed here. An edge [0, 1] foes in both directions.
     *      "edges": [[0, 1], [2, 4], ...]
     * }
     * 
     */
    createNavmesh(): void {
        // Add a layer to display the graph
        let gLayer = this.addLayer("graph");
        gLayer.setHidden(true);

        let navmeshData = this.load.getObject("navmesh");

         // Create the graph
        this.graph = new PositionGraph();

        // Add all nodes to our graph
        for(let node of navmeshData.nodes){
            this.graph.addPositionedNode(new Vec2(node[0], node[1]));
            this.add.graphic(GraphicType.POINT, "graph", {position: new Vec2(node[0], node[1])})
        }

        // Add all edges to our graph
        for(let edge of navmeshData.edges){
            this.graph.addEdge(edge[0], edge[1]);
            this.add.graphic(GraphicType.LINE, "graph", {start: this.graph.getNodePosition(edge[0]), end: this.graph.getNodePosition(edge[1])})
        }

        // Set this graph as a navigable entity
        let navmesh = new Navmesh(this.graph);

        this.navManager.addNavigableEntity(hw4_Names.NAVMESH, navmesh);
    }

    // HOMEWORK 4 - TODO
    /**
     * 
     */
    initializeEnemies(){
        // Get the enemy data
        const enemyData = this.load.getObject("enemyData");

        // Create an enemies array
        this.enemies = new Array(enemyData.numEnemies);

        let actionsGun = [new AttackAction(3, [hw4_Statuses.IN_RANGE], [hw4_Statuses.REACHED_GOAL]),
        new Move(2, [], [hw4_Statuses.IN_RANGE], {inRange: 100}),
        new Retreat(1, [hw4_Statuses.LOW_HEALTH, hw4_Statuses.CAN_RETREAT], [hw4_Statuses.REACHED_GOAL], {retreatDistance: 200})];

        let actionKnife = [new AttackAction(3, [hw4_Statuses.IN_RANGE], [hw4_Statuses.REACHED_GOAL]),
        new Move(2, [], [hw4_Statuses.IN_RANGE], {inRange: 20}),
        new Retreat(4, [hw4_Statuses.LOW_HEALTH, hw4_Statuses.CAN_RETREAT], [hw4_Statuses.REACHED_GOAL], {retreatDistance: 200})];

        //let resultGun = this.generateGoapPlans(actionsGun, [hw4_Statuses.IN_RANGE, hw4_Statuses.LOW_HEALTH, hw4_Statuses.CAN_BERSERK, hw4_Statuses.CAN_RETREAT], hw4_Statuses.REACHED_GOAL);
        //let resultKnife = this.generateGoapPlans(actionKnife, [hw4_Statuses.IN_RANGE, hw4_Statuses.LOW_HEALTH, hw4_Statuses.CAN_BERSERK, hw4_Statuses.CAN_RETREAT], hw4_Statuses.REACHED_GOAL);

        // ELABORATE
        // this.testGoapPlans(resultGun, resultKnife, null, null);
        // Initialize the enemies
        for(let i = 0; i < enemyData.numEnemies; i++){
            let data = enemyData.enemies[i];

            // Create an enemy
            this.enemies[i] = this.add.animatedSprite(data.type, "primary");
            this.enemies[i].position.set(data.position[0], data.position[1]);
            this.enemies[i].animation.play("IDLE");

            // Activate physics
            this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));

            if(data.route){
                data.route = data.route.map((index: number) => this.graph.getNodePosition(index));                
            }

            if(data.guardPosition){
                data.guardPosition = new Vec2(data.guardPosition[0], data.guardPosition[1]);
            }
            //initalize status and actions for each enemy
            let statusArray: Array<string> = [hw4_Statuses.CAN_RETREAT, hw4_Statuses.CAN_BERSERK];

            //Vary weapon type and choose actions
            let weapon;
            let actions;
            let range;
            // HOMEWORK 4 - TODO
            if (data.type === "gun_enemy"){
                weapon = this.createWeapon("weak_pistol")
                actions = actionsGun;
                range = 100;
            }
            else if (data.type === "knife_enemy") {
                weapon = this.createWeapon("knife")
                actions = actionKnife;
                range = 20;
            }
            else if (data.type === "custom_enemy1") {
                //ADD CODE HERE
            }
            else if (data.type === "custom_enemy2") {
                //ADD CODE HERE
            }

            let enemyOptions = {
                defaultMode: data.mode,
                patrolRoute: data.route,            // This only matters if they're a patroller
                guardPosition: data.guardPosition,  // This only matters if the're a guard
                health: data.health,
                player1: this.playerCharacters[0],
                player2: this.playerCharacters[1],
                weapon: weapon,
                goal: hw4_Statuses.REACHED_GOAL,
                status: statusArray,
                actions: actions,
                inRange: range
            }

            this.enemies[i].addAI(EnemyAI, enemyOptions);
        }
    }

    powerset(array: Array<string>): Array<Array<string>> {
        return array.reduce((a, v) => a.concat(a.map((r) => [v].concat(r))), [[]]);
    }

    /**
     * This function takes all possible actions and all possible statuses, and generates a list of all possible combinations and statuses
     * and the actions that are taken when run through the GoapActionPlanner.
     */
    generateGoapPlans(actions: Array<GoapAction>, statuses: Array<string>, goal: string): string {
        let planner = new GoapActionPlanner();
        // Get all possible status combinations
        let statusComboinations = this.powerset(statuses);
        let map = new Map<String>();
        //console.log(statusComboinations.toString());
        
        for (let s of statusComboinations) {
            // Get plan
            let plan = planner.plan(goal, actions, s, null);
            let givenStatuses = "Given: ";
            s.forEach(v => givenStatuses = givenStatuses + v + ", ");

            map.add(givenStatuses, plan.toString())
        }
        
        return map.toString();
    }

    /**
     * Use this function to test and verify that your created plans are correct. Note that you should only start using this function once you're ready to
     * test your berserk action for the existing gun and knife enemies. Your custom enemies can be added whenever they're ready,
     * your tests will pass if you leave the arguments for both null.
     */
    testGoapPlans(gunPlans: string, knifePlans: string, customPlan1: string, customPlan2: string) {
        let expectedKnifeResult = 
        `Given:  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: LOW_HEALTH,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: LOW_HEALTH, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_BERSERK,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: CAN_BERSERK, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_BERSERK, LOW_HEALTH,  -> Top -> (Berserk)\n` +
        `Given: CAN_BERSERK, LOW_HEALTH, IN_RANGE,  -> Top -> (Berserk)\n` +
        `Given: CAN_RETREAT,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: CAN_RETREAT, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_RETREAT, LOW_HEALTH,  -> Top -> (Retreat)\n` +
        `Given: CAN_RETREAT, LOW_HEALTH, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK, LOW_HEALTH,  -> Top -> (Berserk)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK, LOW_HEALTH, IN_RANGE,  -> Top -> (Berserk)\n`;

        let expectedGunResult = 
        `Given:  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: LOW_HEALTH,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: LOW_HEALTH, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_BERSERK,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: CAN_BERSERK, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_BERSERK, LOW_HEALTH,  -> Top -> (Berserk)\n` +
        `Given: CAN_BERSERK, LOW_HEALTH, IN_RANGE,  -> Top -> (Berserk)\n` +
        `Given: CAN_RETREAT,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: CAN_RETREAT, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_RETREAT, LOW_HEALTH,  -> Top -> (Retreat)\n` +
        `Given: CAN_RETREAT, LOW_HEALTH, IN_RANGE,  -> Top -> (Retreat)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK,  -> Top -> (Move) -> (AttackAction)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK, IN_RANGE,  -> Top -> (AttackAction)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK, LOW_HEALTH,  -> Top -> (Retreat)\n` +
        `Given: CAN_RETREAT, CAN_BERSERK, LOW_HEALTH, IN_RANGE,  -> Top -> (Retreat)\n`;

        console.assert(gunPlans === expectedGunResult, {errorMsg: "Your created gun enemy plan does not match the expected behavior patterns"});

        console.assert(knifePlans === expectedKnifeResult, {errorMsg: "Your created knife enemy plan does not match the expected behavior patterns"});

        if (customPlan1 !== null) {
            console.assert(customPlan1 !== expectedGunResult, {errorMsg: "Your first custom plan has the same behavior as the gun enemy"});
            console.assert(customPlan1 !== expectedKnifeResult, {errorMsg: "Your first custom plan has the same behavior as the knife enemy"});
        }

        if (customPlan2 !== null) {
            console.assert(customPlan2 !== expectedGunResult, {errorMsg: "Your second custom plan has the same behavior as the gun enemy"});
            console.assert(customPlan2 !== expectedKnifeResult, {errorMsg: "Your second custom plan has the same behavior as the knife enemy"});
            if (customPlan1 !== null)
                console.assert(customPlan2 !== customPlan1, {errorMsg: "Both of your custom plans have the same behavior"});
        }
    }

    
}