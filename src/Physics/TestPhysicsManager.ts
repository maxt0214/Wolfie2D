import GameNode from "../Nodes/GameNode";
import { Physical, Updateable } from "../DataTypes/Interfaces/Descriptors";
import Tilemap from "../Nodes/Tilemap";
import PhysicsManager from "./PhysicsManager";
import Vec2 from "../DataTypes/Vec2";
import Debug from "../Debug/Debug";
import Color from "../Utils/Color";
import AABB from "../DataTypes/Shapes/AABB";
import OrthogonalTilemap from "../Nodes/Tilemaps/OrthogonalTilemap";

export default class TestPhysicsManager extends PhysicsManager {

	/** The array of static nodes */
	protected staticNodes: Array<Physical>;

	/** The array of dynamic nodes */
	protected dynamicNodes: Array<Physical>;

	/** The array of tilemaps */
	protected tilemaps: Array<Tilemap>;

	constructor(){
		super();
		this.staticNodes = new Array();
		this.dynamicNodes = new Array();
		this.tilemaps = new Array();
	}

	/**
	 * Add a new physics object to be updated with the physics system
	 * @param node The node to be added to the physics system
	 */
	registerObject(node: GameNode): void {
		if(node.isStatic){
			// Static and not collidable
			this.staticNodes.push(node);
		} else {
			// Dynamic and not collidable
			this.dynamicNodes.push(node);
		}
	}

	/**
	 * Registers a tilemap with this physics manager
	 * @param tilemap 
	 */
	registerTilemap(tilemap: Tilemap): void {
		this.tilemaps.push(tilemap);
	}

	setLayer(node: GameNode, layer: string): void {
		node.physicsLayer = this.layerMap.get(layer);
	}

	/**
	 * Updates the physics
	 * @param deltaT 
	 */
	update(deltaT: number): void {
		/*	ALGORITHM:
				In an effort to keep things simple and working effectively, each dynamic node will resolve its
				collisions considering the rest of the world as static.

				Collision detecting will happen first. This can be considered a broad phase, but it is not especially
				efficient, as it does not need to be for this game engine. Every dynamic node is checked against every
				other node for collision area. If collision area is non-zero (meaning the current node sweeps into another),
				it is added to a list of hits.

				INITIALIZATION:
					- Physics constants are reset
					- Swept shapes are recalculated. If a node isn't moving, it is skipped.

				COLLISION DETECTION:
					- For a node, collision area will be calculated using the swept AABB of the node against every other AABB in a static state
					- These collisions will be sorted by area in descending order
				
				COLLISION RESOLUTION:
					- For each hit, time of collision is calculated using a swept line through the AABB of the static node expanded
					  with minkowski sums (discretely, but the concept is there)
					- The collision is resolved based on the near time of the collision (from method of separated axes)
						- X is resolved by near x, Y by near y.
						- There is some fudging to allow for sliding along walls of separate colliders. Sorting by area also helps with this.
						- Corner to corner collisions are resolve to favor x-movement. This is in consideration of platformers, to give
						  the player some help with jumps

				Pros:
					- Everything happens with a consistent time. There is a distinct before and after for each resolution.
					- No back-tracking needs to be done. Once we resolve a node, it is definitively resolved.
				
				Cons:
					- Nodes that are processed early have movement priority over other nodes. This can lead to some undesirable interactions.
		*/
		for(let node of this.dynamicNodes){
			/*---------- INITIALIZATION PHASE ----------*/
			// Clear frame dependent boolean values for each node
			node.onGround = false;
			node.onCeiling = false;
			node.onWall = false;
			node.collidedWithTilemap = false;

			// Update the swept shapes of each node
			if(node.moving){
				// If moving, reflect that in the swept shape
				node.sweptRect.sweep(node._velocity, node.collisionShape.center, node.collisionShape.halfSize);
			} else {
				// If our node isn't moving, don't bother to check it (other nodes will detect if they run into it)
				node._velocity.zero();
				continue;
			}

			/*---------- DETECTION PHASE ----------*/
			// Gather a set of overlaps
			let overlaps = new Array<AreaCollision>();

			// First, check this node against every static node (order doesn't actually matter here, since we sort anyways)
			for(let other of this.staticNodes){
				let collider = other.collisionShape.getBoundingRect();
				let area = node.sweptRect.overlapArea(collider);
				if(area > 0){
					// We had a collision
					overlaps.push(new AreaCollision(area, collider));
				}
			}

			// Then, check it against every dynamic node
			for(let other of this.dynamicNodes){
				let collider = other.collisionShape.getBoundingRect();
				let area = node.sweptRect.overlapArea(collider);
				if(area > 0){
					// We had a collision
					overlaps.push(new AreaCollision(area, collider));
				}
			}

			// Lastly, gather a set of AABBs from the tilemap.
			// This step involves the most extra work, so it is abstracted into a method
			for(let tilemap of this.tilemaps){
				if(tilemap instanceof OrthogonalTilemap){
					this.collideWithOrthogonalTilemap(node, tilemap, overlaps);
				}
			}

			// Sort the overlaps by area
			overlaps = overlaps.sort((a, b) => b.area - a.area);


			/*---------- RESOLUTION PHASE ----------*/
			// For every overlap, determine if we need to collide with it and when
			for(let other of overlaps){
				// Do a swept line test on the static AABB with this AABB size as padding (this is basically using a minkowski sum!)
				// Start the sweep at the position of this node with a delta of _velocity
				const point = node.collisionShape.center;
				const delta = node._velocity;
				const padding = node.collisionShape.halfSize;
				const otherAABB = other.collider;


				const hit = otherAABB.intersectSegment(node.collisionShape.center, node._velocity, node.collisionShape.halfSize);

				if(hit !== null){
					// We got a hit, resolve with the time inside of the hit
					let tnearx = hit.nearTimes.x;
					let tneary = hit.nearTimes.y;

					// Allow edge clipping (edge overlaps don't count, only area overlaps)
					// Importantly don't allow both cases to be true. Then we clip through corners. Favor x to help players land jumps
					if(tnearx < 1.0 && (point.y === otherAABB.top - padding.y || point.y === otherAABB.bottom + padding.y) && delta.x !== 0) {
						tnearx = 1.0;
					} else if(tneary < 1.0 && (point.x === otherAABB.left - padding.x || point.x === otherAABB.right + padding.x) && delta.y !== 0) {
						tneary = 1.0;
					}


					if(hit.nearTimes.x >= 0 && hit.nearTimes.x < 1){
						node._velocity.x = node._velocity.x * tnearx;
					}

					if(hit.nearTimes.y >= 0 && hit.nearTimes.y < 1){
						node._velocity.y = node._velocity.y * tneary;
					}
				}
			}

			// Resolve the collision with the node, and move it
			node.finishMove();
		}
	}

	collideWithOrthogonalTilemap(node: Physical, tilemap: OrthogonalTilemap, overlaps: Array<AreaCollision>): void {
		// Get the min and max x and y coordinates of the moving node
		let min = new Vec2(node.sweptRect.left, node.sweptRect.top);
		let max = new Vec2(node.sweptRect.right, node.sweptRect.bottom);

		// Convert the min/max x/y to the min and max row/col in the tilemap array
		let minIndex = tilemap.getColRowAt(min);
		let maxIndex = tilemap.getColRowAt(max);

		let tileSize = tilemap.getTileSize();

		// Loop over all possible tiles (which isn't many in the scope of the velocity per frame)
		for(let col = minIndex.x; col <= maxIndex.x; col++){
			for(let row = minIndex.y; row <= maxIndex.y; row++){
				if(tilemap.isTileCollidable(col, row)){
					// Get the position of this tile
					let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);

					// Create a new collider for this tile
					let collider = new AABB(tilePos, tileSize.scaled(1/2));

					// Calculate collision area between the node and the tile
					let area = node.sweptRect.overlapArea(collider);
					if(area > 0){
						// We had a collision
						overlaps.push(new AreaCollision(area, collider));
					}
				}
			}
		}
	}
}

class AreaCollision {
	area: number;
	collider: AABB;
	constructor(area: number, collider: AABB){
		this.area = area;
		this.collider = collider;
	}
}