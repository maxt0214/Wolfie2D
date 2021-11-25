import { HW4_Events } from "../../../Homework4/hw4_enums";
import Updateable from "../../DataTypes/Interfaces/Updateable";
import Vec2 from "../../DataTypes/Vec2";
import { GraphicType } from "../../Nodes/Graphics/GraphicTypes";
import Particle from "../../Nodes/Graphics/Particle";
import Scene from "../../Scene/Scene";
import Color from "../../Utils/Color";
import { EaseFunctionType } from "../../Utils/EaseFunctions";
import RandUtils from "../../Utils/RandUtils";

/*
-Move particle system to HW#4, particle class and particle manager(object pool), source, randomized period of decay,
 semi-randomized approach for spawning, should be general purpose 
 and load some settings from a json (location, states, colors, randomization). 
 Should be effect when balloon is popped 
*/

export default class ParticleSystem implements Updateable{
    protected particlePool: Array<Particle>;

    protected lifetime: number;

    protected liveParticles: number;

    protected maxLiveParticles: number;

    protected sourcePoint: Vec2;

    protected particleSize: Vec2;

    constructor(poolSize: number, sourcePoint: Vec2, lifetime: number, size: number, maxParticles: number){
        this.particlePool = new Array(poolSize);
        this.sourcePoint = sourcePoint;
        this.lifetime = lifetime;
        this.particleSize = new Vec2(size, size);
        this.maxLiveParticles = maxParticles;
    }

    initalizePool(scene: Scene, layer: string){
        for(let i = 0; i < this.particlePool.length; i++){
            this.particlePool[i] = <Particle>scene.add.graphic(GraphicType.POINT, layer, 
                {position: this.sourcePoint.clone(), size: this.particleSize.clone()});
                this.particlePool[i].addPhysics();
                this.particlePool[i].isCollidable = false;
        }

    }

    update(deltaT: number) {
        let endRed = RandUtils.randInt(0, 255);
        let endGreen = RandUtils.randInt(0, 255);
        let endBlue = RandUtils.randInt(0, 255);
        for(let particle of this.particlePool){
            if (particle.inUse) {
                particle.decrementAge(deltaT*1000);

                if (particle.age <= 0) {
                    particle.setParticleInactive();
                }

                //particle.vel.y += 200*deltaT;
                particle.move(particle.vel.scaled(deltaT));
            }
            else {
                particle.setParticleActive(this.lifetime, this.sourcePoint.clone());

                particle.color = new Color(0, 0, 0);
                particle.alpha = 1;
                //particle.size.set(1)
                particle.vel = RandUtils.randVec(-150, 150, -100, 100);

                particle.tweens.add("active",{
                    startDelay: 0,
                    duration: 2000,
                    effects: [
                        {
                            property: "alpha",
                            resetOnComplete: true,
                            start: 1,
                            end: 1,
                            ease: EaseFunctionType.IN_OUT_SINE
                        },
                        {
                            property: "colorR",
                            resetOnComplete: true,
                            start: particle.color.r,
                            end: endRed,
                            ease: EaseFunctionType.IN_OUT_SINE
                        },
                        {
                            property: "colorG",
                            resetOnComplete: true,
                            start: particle.color.g,
                            end: endBlue,
                            ease: EaseFunctionType.IN_OUT_SINE
                        },
                        {
                            property: "colorB",
                            resetOnComplete: true,
                            start: particle.color.b,
                            end: endGreen,
                            ease: EaseFunctionType.IN_OUT_SINE
                        },
                        {
                            property: "velY",
                            resetOnComplete: true,
                            start: particle.vel.y,
                            end: particle.vel.y + 600,
                            ease: EaseFunctionType.IN_OUT_SINE
                        }
                        /*{
                            property: "positionY",
                            resetOnComplete: true,
                            start: particle.position.y,
                            end: particle.position.y - RandUtils.randInt(-200, 200) + particle.position.y/1.2,
                            ease: EaseFunctionType.IN_OUT_SINE
                        },*/
                        /*{
                            property: "positionX",
                            resetOnComplete: true,
                            start: particle.position.x,
                            end: particle.position.x + RandUtils.randInt(-200, 200),
                            ease: EaseFunctionType.IN_OUT_SINE
                        },*/

        
                    ]
                });

                particle.tweens.play("active");

                //particle.vel = RandUtils.randVec(-150, 150, -100, 100);
                //console.log(particle.vel.toString());
            }
        }
    }

}
