import {Point, rand} from "./math.js";
import {RGB, rgb_to_string_with_alpha, TimeInfo} from "./time.js";

type Particle = {
    position: Point
    velocity: Point
    size: number
    color:RGB,
}

export type ParticleEffectParams = {
    position:Point
    color:RGB,
    count:number,
}
export class ParticleEffect {
    private particles: Particle[];
    private position: Point;
    private start_count: number;
    private age: number;
    private lifetime: number;

    constructor(params:ParticleEffectParams) {
        this.position = params.position
        this.start_count = params.count
        this.particles = []
        for (let i = 0; i < this.start_count; i++) {
            this.particles.push({
                position: params.position,
                velocity: new Point(rand(-100, 100), rand(-100, 100)),
                color: params.color,
                size: rand(2, 7)
            })
        }
        this.lifetime = 1.0
        this.age = 0
    }

    update(time: TimeInfo) {
        this.age += time.delta
        this.particles.forEach(part => part.position = part.position.add(part.velocity.scale(time.delta)))
    }

    draw(time: TimeInfo, ctx: CanvasRenderingContext2D) {

        this.particles.forEach(part => {
            let fade = 1.0 - this.age / this.lifetime
            ctx.fillStyle = rgb_to_string_with_alpha(part.color,fade)
            ctx.fillRect(part.position.x, part.position.y, part.size, part.size)
        })
    }

    isAlive() {
        return (this.age < this.lifetime)
    }
}
