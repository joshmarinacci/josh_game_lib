import {lerp_number, Point, range, Size} from "./math.js";
import {BLACK, BLUE, GREEN, LinearGradientFill, RED, RGB} from "./color.js";
import {RequestAnimGameRunner, TickClient, TimeInfo} from "./time.js";

abstract class Shape {
    color: RGB;
    position: Point;
    alpha: number;
    scale: number;
    rotate: number;
    constructor() {
        this.position = new Point(0,0)
        this.scale = 1.0
        this.rotate = 0.0
        this.color = RED
        this.alpha = 1.0
    }

    abstract draw(ctx: CanvasRenderingContext2D):void;
}

class TextShape extends Shape {
    private text: string;
    constructor() {
        super();
        this.text = "FlashBreak"
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.text,0,0)
    }
}
class Rect extends Shape {
    size: Size;
    fill: LinearGradientFill|undefined;
    constructor() {
        super()
        this.size = new Size(25,25)
    }
    draw(ctx: CanvasRenderingContext2D) {
        if(this.fill !== undefined) {
            let fill:LinearGradientFill = this.fill
            let grad = ctx.createLinearGradient(fill.start.x,fill.start.y,fill.end.x,fill.end.y)
            fill.stops.forEach(stop => {
                grad.addColorStop(stop.position,stop.color.toCSSString())
            })
            ctx.fillStyle = grad
        }
        ctx.fillRect(0,0,this.size.w,this.size.h)
    }
}


type AnimProps = {
    prop?:string
    from:any
    to:any
    over:number
}

type SpreadProps = {
    prop:string
    from:any
    to:any
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
        if(!this.alive) return
        if(!this.started) {
            this.start_time = 0
            this.started = true
        }
        let t = this.curr_time/this.duration
        // console.log("t is",t.toFixed(2),this.from)
        if(!this.prop) {
            Object.keys(this.from).forEach(key => {
                this.target[key] = lerp_any(t, this.from[key], this.to[key])
            })
        } else {
            this.target[this.prop] = lerp_any(t, this.from, this.to)
        }
        if(this.curr_time >= this.duration) {
            this.alive = false
        }
        this.curr_time += time.delta
    }

}
function lerp_any(t: number, from: any, to: any):any {
    if(typeof from === "number") return lerp_number(t,from,to)
    if(typeof from.lerp === 'function') {
        return from.lerp(t,to)
    }
    console.warn("cannot lerp",from)
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

    spread(rects: Rect[], opt: SpreadProps) {
        rects.forEach((rect,i) => {
            let t= i/(rects.length-1)
            rect[opt.prop] = lerp_any(t, opt.from, opt.to)
        })
    }
}
const twerp = new Twerp()

type Example = {
    title:string,
    canvas:HTMLCanvasElement,
    shapes:Shape[],
}

function make_canvas() {
    let canvas = document.createElement('canvas')
    canvas.style.width = '150px'
    canvas.width = 300
    canvas.height = 300
    document.body.appendChild(canvas)
    return canvas

}
function make_example_1():Example {
    //example 1:  animate from left to right over 5 seconds. that's it.
    let rect = new Rect()
    rect.size = new Size(25,25)
    rect.position = new Point(25,25)
    twerp.tween(rect.position,{
        prop:'x',
        from:50,
        to:250,
        over:1,
    })
     return {
        title:'x 50 -> 250 over 1 second',
        canvas: make_canvas(),
        shapes: [rect],
    }
}
function make_example_2():Example {
    //example 2: animate left to right and top to bottom over 2 seconds.
    let rect = new Rect()
    rect.size = new Size(25,25)
    twerp.tween(rect,{
        prop:'position',
        from:new Point(0,0),
        to:new Point(250,250),
        over:1,
    })
    return {
        title:'position 0,0 -> 250,250. 1s',
        shapes:[rect],
        canvas:make_canvas()
    }

}
function make_example_3():Example {
    //example 3: animate color from red to blue over 2 seconds
    let rect = new Rect()
    rect.size = new Size(150,150)
    twerp.tween(rect,{
        prop:'color',
        from:RED,
        to:BLUE,
        over:1,
    })
    return {
        title:'color RED -> BLUE, 1s',
        shapes:[rect],
        canvas:make_canvas()
    }
}
function make_example_4():Example {
    // move rect and change color at the same time
    let rect = new Rect()
    rect.size.set(50,50)
    twerp.tween(rect,{
        from:{
            "position":new Point(0,0),
            "color":RED,
        },
        to: {
            "position":new Point(250,250),
            "color":BLUE
        },
        over:2,
    })
    return {
        title:'position & color, 2s',
        shapes:[rect],
        canvas:make_canvas()
    }
}
function make_example_5():Example {
    //Spread to create objects over one or two dimensions
    let rects = range(10).map(i => new Rect())
    twerp.spread(rects,{
        prop:'position',
        from: new Point(0,0),
        to: new Point(280,0),
    })
    twerp.spread(rects,{
        prop:'color',
        from: GREEN,
        to:BLUE,
    })
    return {
        title:'spread 10 rects position and color',
        shapes:rects,
        canvas:make_canvas(),
    }
}
function make_example_6():Example {
    let shape = new TextShape()
    shape.position = new Point(100,150)
    twerp.tween(shape,{
        from:{
            "scale":0.5,
            "rotate":0,
            // "alpha":1.0,
        },
        to: {
            "scale":1.5,
            "rotate":Math.PI*2,
            // "alpha":0.0
        },
        over:3,
    })
    return {
        title:'scale, rotate, 3s',
        shapes:[shape],
        canvas:make_canvas(),
    }
}
function make_example_7():Example {
    let rect = new Rect()
    rect.position = new Point(0,100)
    rect.size.set(300,100)
    let grad1 = new LinearGradientFill(new Point(100,0,),new Point(200,0))
    grad1.addColorStop(0.0,RED)
    grad1.addColorStop(1.0,GREEN)
    rect.fill = grad1
    let grad2 = new LinearGradientFill(new Point(0,0,),new Point(300,0))
    grad2.addColorStop(0.0,BLACK)
    grad2.addColorStop(1.0,BLACK)
    twerp.tween(rect,{
        from:{
            "fill":grad1,
        },
        to: {
            "fill":grad2
        },
        over:2,
    })
    return {
        title:'fill rect with animated gradient',
        shapes:[rect],
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
        this.examples.push(make_example_4())
        this.examples.push(make_example_5())
        this.examples.push(make_example_6())
        this.examples.push(make_example_7())

        this.runner = new RequestAnimGameRunner(1)
        this.runner.start(this)
    }
    tick(time:TimeInfo) {
        twerp.update(time)
        this.examples.forEach(ex => {
            let ctx = ex.canvas.getContext('2d')
            ctx.fillStyle = 'white'
            ctx.fillRect(0,0,ex.canvas.width,ex.canvas.height)
            ex.shapes.forEach(shape => {
                ctx.save()
                ctx.translate(shape.position.x,shape.position.y)
                ctx.scale(shape.scale,shape.scale)
                ctx.rotate(shape.rotate)
                ctx.globalAlpha = shape.alpha
                ctx.fillStyle = shape.color.toCSSString()
                shape.draw(ctx)
                ctx.restore()
            })
            ctx.fillStyle = 'black'
            ctx.font = '16px sans-serif'
            ctx.fillText(ex.title, 10,ex.canvas.height-10)
        })
    }
}
