import {Bounds, lerp_rgb, Point, rand} from "./math.js";
import {Seconds, TimeInfo, TValue} from "./time.js";
import {RGB, rgb_to_string, rgb_to_string_with_alpha} from "./color.js";

export type Particle = {
    position: Point
    velocity: Point
    size: number
    color:RGB
    alpha:number
    age: number
}

export type ParticleEffectParams = {
    position:Point
    color:RGB,
    count:number,
    maxLifetime:number,
    delay?:number,
    init?: (effect: ParticleEffect) => void;
    update?: (time:TimeInfo, effect: ParticleEffect) => void;
    draw?: (time:TimeInfo, ctx:CanvasRenderingContext2D, effect: ParticleEffect) => void;
}
export class ParticleEffect {
    particles: Particle[];
    private position: Point;
    private start_count: number;
    age: number;
    private maxLifetime: number;
    private delay: number;
    private draw_cb: (time: TimeInfo, ctx: CanvasRenderingContext2D, effect: ParticleEffect) => void;
    private update_cb: (time:TimeInfo, effect: ParticleEffect) => void;

    constructor(opts:ParticleEffectParams) {
        this.position = opts.position
        this.start_count = opts.count
        this.particles = []
        for (let i = 0; i < this.start_count; i++) {
            this.particles.push({
                position: opts.position,
                velocity: new Point(rand(-100, 100), rand(-100, 100)),
                color: opts.color,
                size: rand(2, 7),
                alpha: 1.0,
                age: 0
            })
        }
        this.maxLifetime = opts.maxLifetime
        this.age = 0
        this.delay = opts.delay?opts.delay:0
        if(opts.init) {
            opts.init(this)
        }
        this.draw_cb = opts.draw
        this.update_cb = opts.update
    }

    update(time: TimeInfo) {
        this.age += time.delta
        if(this.update_cb) {
            this.update_cb(time, this)
        } else {
            this.particles.forEach(part => part.position = part.position.add(part.velocity.scale(time.delta)))
        }
    }

    draw(time: TimeInfo, ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.position.x,this.position.y)
        if(this.draw_cb) {
            this.draw_cb(time,ctx,this)
        } else {
            this.particles.forEach(part => {
                let fade = 1.0 - this.age / this.maxLifetime
                ctx.fillStyle = rgb_to_string_with_alpha(part.color, fade)
                ctx.fillRect(part.position.x, part.position.y, part.size, part.size)
            })
        }
        ctx.restore()
    }

    isAlive() {
        return (this.age < this.maxLifetime)
    }
}

class TimedEffect {
    private duration: Seconds;
    protected running: boolean;
    private time: number;

    constructor(duration: number) {
        this.duration = duration
        this.running = false
        this.time = 0
    }

    start() {
        this.running = true
        this.time = 0
    }

    stop() {
        this.running = false
        this.time = 0
    }

    protected update(time: TimeInfo): TValue {
        this.time += time.delta
        if (this.time > this.duration) {
            this.running = false
        }
        return this.time / this.duration
    }
}

export class Wiggle extends TimedEffect {
    offset: Point;
    private count: number;

    constructor(offset: Point, duration: Seconds, count: number) {
        super(duration)
        this.count = count
        this.offset = offset
    }

    makeBounds(time: TimeInfo, bounds: Bounds) {
        let t = this.update(time)
        if (this.running) {
            let t2 = t * Math.PI * 2 // 0 -> 2pi
            let theta = Math.sin(t2 * this.count) // -1 to 1
            let off = this.offset.scale(theta)
            return bounds.add(off)
        } else {
            return bounds.add(new Point(0, 0))
        }
    }

}

export class Fader extends TimedEffect {
    private startVal: RGB;
    private endVal: RGB;

    constructor(start: RGB, end: RGB, duration: Seconds) {
        super(duration)
        this.startVal = start
        this.endVal = end
    }

    makeColor(time: TimeInfo): string {
        let t = this.update(time)
        if (this.running) {
            let rgb = lerp_rgb(this.startVal, this.endVal, t)
            return rgb_to_string(rgb)
        } else {
            return rgb_to_string(this.endVal)
        }
    }
}
