import {BLACK, BLUE, GREEN, LinearGradientFill, RED, WHITE} from "../color.js";
import {RequestAnimGameRunner, TickClient, TimeInfo} from "../time.js";
import {Twerp} from "../anim.js";
import {Shape} from "../shapes.js";
import {Point, range, Size} from "josh_js_util";

function gradientToCanvas(fill:LinearGradientFill, ctx:CanvasRenderingContext2D) {
    let grad = ctx.createLinearGradient(fill.start.x,fill.start.y,fill.end.x,fill.end.y)
    fill.stops.forEach(stop => {
        grad.addColorStop(stop.position,stop.color.toCSSString())
    })
    return grad
}

class TextShape extends Shape {
    private text: string;
    fontSize: string;
    fontFamily: string;
    weight: string;
    fill?: LinearGradientFill;
    constructor(text:string) {
        super();
        this.text = text
        this.fontSize = '16px'
        this.fontFamily = 'sans-serif'
        this.weight = 'normal'
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = `${this.weight} ${this.fontSize} ${this.fontFamily}`
        if(this.fill !== undefined) {
            ctx.fillStyle = gradientToCanvas(this.fill,ctx)
        }
        ctx.fillText(this.text,0,0)
    }
}
class Rect extends Shape {
    size: Size;
    fill?: LinearGradientFill;
    constructor() {
        super()
        this.size = new Size(25,25)
    }
    draw(ctx: CanvasRenderingContext2D) {
        if(this.fill !== undefined) {
            ctx.fillStyle = gradientToCanvas(this.fill,ctx)
        }
        ctx.fillRect(0,0,this.size.w,this.size.h)
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
    let shape = new TextShape("mow")
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
function make_example_8():Example {
    let rect = new Rect()
    const seq = async () => {
        await twerp.tween(rect,{
            prop:"position",
            from:new Point(0,0),
            to:new Point(100,0),
            over:0.5,
        })
        await twerp.tween(rect,{
            prop:'position',
            from:new Point(100,0),
            to:new Point(100,150),
            over:1.0,
        })
        await twerp.tween(rect,{prop:'color',from:RED,to:GREEN, over:1.0})
        while(true) {
            await twerp.tween(rect,{prop:'scale',from:1.0,to:3.0,over:1.0})
            await twerp.tween(rect,{prop:'scale',from:3.0,to:1.0,over:1.0})
        }
    }
    seq()
    return {
        title:'await sequence and infinite loop',
        shapes:[rect],
        canvas:make_canvas(),
    }
}
function make_example_9() {
    let rect = new Rect()
    rect.position = new Point(50,150)
    rect.size = new Size(100,100)
    rect.color = WHITE
    const seq = async () => {
        // sleep for 1 second
        await twerp.tween(rect, {prop:"",from:0,to:0,over:1})
        //quick to black
        await twerp.tween(rect,{prop:'color',from:WHITE,to:BLACK, over:0.5})
        //quick to white
        await twerp.tween(rect,{prop:'color',from:BLACK,to:WHITE, over:0.25})

        await twerp.tween(rect, {prop:"",from:0,to:0,over:0.5})

        //horizontal gradient of black on white slides down
        let grad1 = new LinearGradientFill(new Point(50,0),new Point(50,100))
        grad1.addColorStop(0.0,WHITE)
        grad1.addColorStop(0.49,WHITE)
        grad1.addColorStop(0.5,BLACK)
        grad1.addColorStop(0.51,WHITE)
        grad1.addColorStop(1.0,WHITE)
        let grad2 = new LinearGradientFill(new Point(50,0),new Point(50,100))
        grad2.addColorStop(0.0,WHITE)
        grad2.addColorStop(0.1,WHITE)
        grad2.addColorStop(0.5,BLACK)
        grad2.addColorStop(0.8,WHITE)
        grad2.addColorStop(1.0,WHITE)
        await twerp.tween(rect,{ prop:"fill",from:grad1, to:grad2, over:4 })
        let grad3 = new LinearGradientFill(new Point(50,100), new Point(50,0))
        grad3.addColorStop(0.0,WHITE)
        grad3.addColorStop(0.1,WHITE)
        grad3.addColorStop(0.5,WHITE)
        grad3.addColorStop(0.8,WHITE)
        grad3.addColorStop(1.0,WHITE)
        await twerp.tween(rect,{ prop:"fill",from:grad2, to:grad3, over:1 })
    }
    seq()
    return {
        title:'large gradient text',
        shapes:[rect],
        canvas:make_canvas(),
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
        this.examples.push(make_example_8())
        this.examples.push(make_example_9())

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
