import {Bounds, lerp_number, Point, Size} from "./math.js";
import {BLUE, RED, RGB, rgb_to_string} from "./color.js";
import {RequestAnimGameRunner, TickClient, TimeInfo} from "./time.js";

class Rect {
    color: RGB;
    position: Point;
    size: Size;
    alpha: number;
    constructor() {
        this.position = new Point(0,0)
        this.size = new Size(50,50)
        this.color = RED
        this.alpha = 1.0
    }
}


type AnimProps = {
    prop:string
    from:any
    to:any
    over:number
}
class TwerpAnim {
    private target: any;
    private prop: string;
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
        if(!this.alive) return
        if(!this.started) {
            this.start_time = 0
            this.started = true
        }
        let t = this.curr_time/this.duration
        // console.log("t is",t.toFixed(2),this.from.lerp)
        let val = this.lerp(t,this.from,this.to)
        // console.log(t.toFixed(2),val)
        this.target[this.prop] = val
        if(this.curr_time >= this.duration) {
            this.alive = false
        }
        this.curr_time += time.delta
    }

    private lerp(t: number, from: any, to: any):any {
        if(typeof from.lerp === 'function') {
            return from.lerp(t,to)
        } else {
            return lerp_number(t, from, to)
        }
    }
}

class Twerp {
    private anims: TwerpAnim[];
    constructor() {
        this.anims = []
    }

    update(time: TimeInfo) {
        this.anims.forEach(anim => anim.update(time))
    }

    tween(target: any, opts: AnimProps) {
        this.anims.push(new TwerpAnim(target,opts))
    }
}
const twerp = new Twerp()

type Example = {
    canvas:HTMLCanvasElement,
    rect:Rect,
}

function make_canvas() {
    let canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 100
    document.body.appendChild(canvas)
    return canvas

}
function make_example_1():Example {
    //example 1:  animate from left to right over 5 seconds. that's it.
    let rect1 = new Rect()
    rect1.position.y = 25
    twerp.tween(rect1.position,{
        prop:'x',
        from:50,
        to:500,
        over:2,
    })
     return {
        canvas: make_canvas(),
        rect: rect1
    }
}

function make_example_2():Example {
    //example 2: animate left to right and top to bottom over 2 seconds.
    let rect2 = new Rect()
    twerp.tween(rect2,{
        prop:'position',
        from:new Point(0,0),
        to:new Point(500,50),
        over:2,
    })
    return {
        rect:rect2,
        canvas:make_canvas()
    }

}

function make_example_3():Example {
    //example 3: animate color from red to blue over 2 seconds
    let rect3 = new Rect()
    twerp.tween(rect3,{
        prop:'color',
        from:RED,
        to:BLUE,
        over:2,
    })
    return {
        rect:rect3,
        canvas:make_canvas()
    }
}

export class AnimExample implements TickClient {
    private runner: RequestAnimGameRunner;
    private examples: Example[]
    constructor() {
        this.examples = []
    }
    start() {
        this.examples.push(make_example_1())
        this.examples.push(make_example_2())
        this.examples.push(make_example_3())

        this.runner = new RequestAnimGameRunner(1)
        this.runner.start(this)
    }
    tick(time:TimeInfo) {
        twerp.update(time)
        this.examples.forEach(ex => {
            let ctx = ex.canvas.getContext('2d')
            ctx.fillStyle = 'white'
            ctx.fillRect(0,0,ex.canvas.width,ex.canvas.height)
            ctx.fillStyle = rgb_to_string(ex.rect.color)
            ctx.fillRect(ex.rect.position.x,ex.rect.position.y,ex.rect.size.w,ex.rect.size.h)
        })
    }
}
