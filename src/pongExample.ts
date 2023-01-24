/*

game entity
save of the entity. can hurt the player? is a block? has special behaviors
velocity
add a block view to draw as a rectangle with a border
when a bumper is hit, check if bumper, apply a fade effect
fade effect brightens then darkens color over a certain time period.
maintains own state. can be removed once done.
how do we pass around events? some sort of event handlers? listeners?
sound effect triggered when bumper is hit. what is the connection for this?
jiggle effect: draws a block adjusted left or right over time. doesn't effect bounds collision.

if ball hits paddle and left or right is currently pressed, then adjust the bounce with a tiny bit of spin.
also blink the ball when hit and trigger sound effect.

start with a Paddle and Ball and Bumper classes, then try to collect common functions

* add angle adjustment if hits a moving object
* draw grid object and 'moving' object with different colors.
* be able to change grid cell after a collision. needs a way to get the grid coords back.
 */
import {Bounds, Point, Size} from "./math.js";
import {
    Fader,
    GameRunner,
    RequestAnimGameRunner,
    RGB, rgb_to_string,
    TickClient,
    TimeInfo,
    Wiggle
} from "./time.js";
import {check_collision_block} from "./physics.js";
import {Cell, check_collision_grid, Grid} from "./grid.js";
import {KeyboardSystem} from "./keyboard.js";

class Ball {
    bounds:Bounds
    velocity:Point
    fader:Fader
    constructor() {
        this.fader = new Fader({r:0.9,g:0,b:0},YELLOW,0.150)
        this.bounds = new Bounds(50,150,5,5)
        this.velocity = new Point(1.2,1.2)
    }
}

class Paddle {
    bounds:Bounds
    constructor() {
        this.bounds = new Bounds(50,160,50,10)
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'blue'
        ctx.fillRect(this.bounds.x,this.bounds.y,this.bounds.w,this.bounds.h)
    }
}
const RED:RGB = {r:1,g:0,b:0}
const BLACK:RGB = {r:0,g:0,b:0}
const WHITE:RGB = {r:1,g:1,b:1}
const VIOLET:RGB = {r:0.3,g:0,b:0.8}
const YELLOW:RGB = {r:1.0, g:0.8, b:0.1}

class Bumper {
    bounds:Bounds
    private bounce: number;
    fade: Fader;
    wiggle: Wiggle;
    constructor(x,y,w,h) {
        this.bounds = new Bounds(x,y,w,h)
        this.bounce = 0
        this.fade = new Fader(WHITE, VIOLET,0.25)
        this.wiggle = new Wiggle(new Point(0,2),0.25,3)
    }

    draw(ctx, time: TimeInfo) {
        this.bounce += 1
        let vis = this.wiggle.makeBounds(time,this.bounds)
        // let vis = this.bounds
        ctx.fillStyle = this.fade.makeColor(time)
        // ctx.fillStyle = 'magenta'
        ctx.fillRect(vis.x,vis.y,vis.w,vis.h)
    }
}

const DEBUG = {
    GRID:false,
    METRICS: false
}
const SCREEN = new Size(200,200)
const SCALE = 3

const BORDER_WIDTH = 10
export class PongExample implements TickClient {
    private canvas: HTMLCanvasElement
    private ball: Ball
    private blocks: Bumper[]
    private grid: Grid
    private game_runner: GameRunner;
    private paddle: Paddle;
    private keyboard: KeyboardSystem;
    constructor() {
        this.ball = new Ball()
        this.paddle = new Paddle()
        const top_bumper = new Bumper(0,0,SCREEN.w,BORDER_WIDTH)
        const bot_bumper = new Bumper(0,SCREEN.h-BORDER_WIDTH,SCREEN.w,BORDER_WIDTH)
        const right_bumper = new Bumper(SCREEN.w-BORDER_WIDTH,BORDER_WIDTH,
            BORDER_WIDTH,SCREEN.h-BORDER_WIDTH*2)
        right_bumper.wiggle.offset = new Point(2,0)
        const left_bumper = new Bumper(0,BORDER_WIDTH,
            BORDER_WIDTH,SCREEN.h-BORDER_WIDTH-BORDER_WIDTH)
        left_bumper.wiggle.offset = new Point(2,0)

        this.blocks = [top_bumper,bot_bumper,right_bumper,left_bumper]
        this.grid = new Grid(Math.floor((SCREEN.w-BORDER_WIDTH*6)/10),8, 10)
        this.grid.forEach((cell:Cell)=> cell.value = 1)
        this.grid.position = new Point(30,30)
    }

    attach(element: Element) {
        this.canvas = element as unknown as HTMLCanvasElement
        this.keyboard = new KeyboardSystem(this.canvas)
    }
    tick(time:TimeInfo) {
        this.update(time)
        this.draw(time)
    }
    start() {
        this.game_runner = new RequestAnimGameRunner()
        // this.game_runner = new SetIntervalTicker(100)
        this.game_runner.start(this)
    }

    private update(time: TimeInfo) {
        if(this.keyboard.isPressed('ArrowRight')) {
            this.paddle.bounds.add_self(new Point(3,0))
            if(this.paddle.bounds.right() > SCREEN.w - BORDER_WIDTH) {
                this.paddle.bounds.set_right(SCREEN.w - BORDER_WIDTH)
            }
        }
        if(this.keyboard.isPressed('ArrowLeft')) {
            this.paddle.bounds.add_self(new Point(-3,0))
            if(this.paddle.bounds.left() < BORDER_WIDTH) {
                this.paddle.bounds.set_left(BORDER_WIDTH)
            }
        }
        let new_bounds = this.ball.bounds.add(this.ball.velocity)
        let r3 = check_collision_block(this.ball.bounds,this.paddle.bounds,this.ball.velocity)
        if(r3.collided) {
            new_bounds = this.ball.bounds.add(this.ball.velocity.scale(r3.tvalue))
            //reflect velocity
            this.ball.velocity = this.ball.velocity.multiply(r3.reflection)
            this.ball.fader.start()
        }
        this.blocks.forEach(bumper => {
            let blk = bumper.bounds
            let r = check_collision_block(this.ball.bounds, blk, this.ball.velocity)
            if(r.collided) {
                //new bounds based on the fraction of velocity before hit the barrier
                new_bounds = this.ball.bounds.add(this.ball.velocity.scale(r.tvalue))
                //reflect velocity
                this.ball.velocity = this.ball.velocity.multiply(r.reflection)
                this.ball.fader.start()
                bumper.fade.start()
                bumper.wiggle.start()
            }
        })
        let r = check_collision_grid(this.grid,this.ball.bounds, this.ball.velocity)
        if(r.collided) {
            new_bounds = this.ball.bounds.add(this.ball.velocity.scale(r.tvalue))
            this.ball.velocity = this.ball.velocity.multiply(r.reflection)
            let cell = r.target as Cell
            cell.value = 0
            // this.game_runner.stop()
        }
        this.ball.bounds = new_bounds
    }

    private draw(time: TimeInfo) {
        let ctx = this.canvas.getContext('2d')
        ctx.save()
        ctx.translate(1.5,1.5)
        ctx.scale(SCALE,SCALE)
        ctx.imageSmoothingEnabled = false

        // clear bg
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)

        // draw pixel grid
        if(DEBUG.GRID) {
            for (let i = 0; i <= this.canvas.width; i += 100) {
                ctx.beginPath()
                ctx.moveTo(i, 0)
                ctx.lineTo(i, this.canvas.height - 1)
                ctx.strokeStyle = '#222222'
                ctx.stroke()
            }
            for (let j = 0; j <= this.canvas.height; j += 100) {
                ctx.beginPath()
                ctx.moveTo(0, j)
                ctx.lineTo(this.canvas.width - 1, j)
                ctx.strokeStyle = '#222222'
                ctx.stroke()
            }
        }

        // blocks
        this.blocks.forEach(bumper => bumper.draw(ctx,time))

        // ball
        ctx.fillStyle = this.ball.fader.makeColor(time)
        ctx.fillRect(this.ball.bounds.x,this.ball.bounds.y,this.ball.bounds.w,this.ball.bounds.h)
        // this.fill_bounds(ctx,this.ball.bounds,'#c50202')
        ctx.strokeStyle = rgb_to_string(YELLOW)
        ctx.strokeRect(this.ball.bounds.x,this.ball.bounds.y,this.ball.bounds.w,this.ball.bounds.h)

        // grid
        this.grid.draw(ctx)

        // paddle
        this.paddle.draw(ctx)

        if(DEBUG.METRICS) {
            // debug
            ctx.save()
            ctx.translate(30, this.canvas.height - 100)
            ctx.fillStyle = 'white'
            ctx.font = '14px sans-serif'
            ctx.fillText(`v = ${this.ball.velocity.toString()}`, 0, 0)
            ctx.fillText(`ball = ${this.ball.bounds.toString()}`, 0, 0 + 20)
            ctx.restore()
        }
        ctx.restore()
    }

    private stroke_bounds(ctx: CanvasRenderingContext2D, bounds: Bounds, color:string) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.strokeRect(bounds.x, bounds.y, bounds.w-1, bounds.h-1)
    }
    private fill_bounds(ctx: CanvasRenderingContext2D, bounds: Bounds, color:string) {
        ctx.fillStyle = color
        ctx.fillRect(bounds.x, bounds.y, bounds.w-1, bounds.h-1)
    }

}

