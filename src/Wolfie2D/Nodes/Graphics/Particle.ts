import Vec2 from "../../DataTypes/Vec2";
import Point from "./Point";

/**
 * - Position X
- Velocity (speed and direction) X
- Color X
- Lifetime 
- Age can be handled as lifetime
- Shape X
- Size X
- Transparency X
 */


export default class Particle extends Point {
    age: number;

    inUse: boolean;

    vel: Vec2;

    constructor(position: Vec2, size: Vec2) {
        // Are we making this a circle?
        super(position, size);
        this.inUse = false;
    }

    setParticleActive(lifetime: number, position: Vec2) {
        this.age = lifetime;
        this.inUse = true;
        this.visible = true;
        this.position = position;
    }

    decrementAge(decay: number) {
        this.age -= decay;
    }

    setParticleInactive(){
        this.inUse = false;
        this.visible = false;
    }

    set velY(y: number){
        this.vel.y = y;
    }

    get velY(): number {
        return this.vel.y;
    }


}