import {TimeInfo} from "./time.js";
import {lerp_number} from "./math.js";
import {Shape} from "./shapes.js";

type AnimProps = {
    prop?: string
    from: any
    to: any
    over: number
}
type SpreadProps = {
    prop: string
    from: any
    to: any
}

class TwerpAnim {
    private target: any;
    private prop?: string;
    private from: any;
    private to: any;
    private duration: number;
    private started: boolean;
    private start_time: number;
    private curr_time: number;
    private alive: boolean;

    constructor(target: any, opts: AnimProps) {
        this.target = target
        this.prop = opts.prop
        this.from = opts.from
        this.to = opts.to
        this.duration = opts.over
        this.started = false
        this.start_time = 0
        this.curr_time = 0
        this.alive = true
    }

    update(time: TimeInfo) {
        if (!this.alive) return
        if (!this.started) {
            this.start_time = 0
            this.started = true
        }
        let t = this.curr_time / this.duration
        // console.log("t is",t.toFixed(2),this.from)
        if (!this.prop) {
            Object.keys(this.from).forEach(key => {
                this.target[key] = lerp_any(t, this.from[key], this.to[key])
            })
        } else {
            this.target[this.prop] = lerp_any(t, this.from, this.to)
        }
        if (this.curr_time >= this.duration) {
            this.alive = false
        }
        this.curr_time += time.delta
    }

}

function lerp_any(t: number, from: any, to: any): any {
    if (typeof from === "number") return lerp_number(t, from, to)
    if (typeof from.lerp === 'function') {
        return from.lerp(t, to)
    }
    console.warn("cannot lerp", from)
}

export class Twerp {
    private anims: TwerpAnim[];

    constructor() {
        this.anims = []
    }

    update(time: TimeInfo) {
        this.anims.forEach(anim => anim.update(time))
    }

    tween(target: any, opts: AnimProps): Promise<TwerpAnim> {
        return new Promise((res, rej) => {
            let twerp = new TwerpAnim(target, opts)
            this.anims.push(twerp)
            setTimeout(() => {
                res(twerp)
            }, opts.over * 1000)
        })
    }

    spread(rects: Shape[], opt: SpreadProps) {
        rects.forEach((rect, i) => {
            let t = i / (rects.length - 1)
            rect[opt.prop] = lerp_any(t, opt.from, opt.to)
        })
    }
}
