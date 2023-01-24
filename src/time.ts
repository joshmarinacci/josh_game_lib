import {Bounds, Point} from "./math.js";

export type TimeInfo = {
    sinceStart:number,
    delta:number,
}
export interface TickClient {
    tick(time:TimeInfo):void
}

export interface GameRunner {
    start(p: TickClient): void;
    stop(): void;
}

export class RequestAnimGameRunner implements GameRunner {
    private running: boolean;
    private last: number;

    constructor() {
        this.running = false
        this.last = 0
    }

    start(p: TickClient): void {
        this.running = true
        let self = this

        function going(ts) {
            ts = ts/1000
            let time:TimeInfo=  {
                sinceStart:ts,
                delta:ts-self.last
            }
            self.last = ts
             p.tick(time)
            if (self.running) requestAnimationFrame(going)
        }

        requestAnimationFrame(going)
    }

    stop() {
        this.running = false
    }
}

export class SetIntervalTicker implements GameRunner {
    private running: boolean;
    private delay: number;
    private handle: number;
    private time: number;

    constructor(delay: number) {
        this.running = false
        this.delay = delay
        this.time = 0
    }

    start(p: TickClient) {
        this.handle = setInterval(() => {
            this.time += this.delay
            p.tick({delta:this.delay, sinceStart:this.time})
        }, this.delay)
    }

    stop() {
        clearInterval(this.handle)
    }
}

export function rgb_to_string(rgb: RGB) {
    let r = Math.floor(rgb.r * 255)
    let g = Math.floor(rgb.g * 255)
    let b = Math.floor(rgb.b * 255)
    return `rgb(${r} ${g} ${b})`
}
export function rgb_to_string_with_alpha(rgb:RGB, alpha:number) {
    let r = (rgb.r*100).toFixed(0)
    let g = (rgb.g*100).toFixed(0)
    let b = (rgb.b*100).toFixed(0)
    let a = (alpha*100).toFixed(0)
    return `rgb(${r}% ${g}% ${b}% / ${a}%)`
}

function lerp(s: number, e: number, t: number): number {
    if (t <= 0) return s
    if (t >= 1) return e
    return s + (e - s) * t
}

function lerp_rgb(s: RGB, e: RGB, t: number): RGB {
    return {
        r: lerp(s.r, e.r, t),
        g: lerp(s.g, e.g, t),
        b: lerp(s.b, e.b, t),
    }
}

type Seconds = number
type TValue = number

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

    constructor(offset: Point, duration: Seconds, count:number) {
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

export type RGB = {
    r: number
    g: number
    b: number
}
