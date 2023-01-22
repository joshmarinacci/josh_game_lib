/*


* add angle adjustment if hits a moving object
* draw grid object and 'moving' object with different colors.
* be able to change grid cell after a collision. needs a way to get the grid coords back.
 */
import {Bounds, Point, Size} from "./math.js";
import {GameRunner, RequestAnimGameRunner} from "./time.js";
import {check_collision_block} from "./physics.js";
import {Cell, check_collision_grid, Grid} from "./grid.js";

class Ball {
    bounds:Bounds
    velocity:Point
}

const DEBUG = {
    GRID:false,
    METRICS: false
}
const SCREEN = new Size(500,500)

export class Example {
    private canvas: HTMLCanvasElement
    private ball: Ball
    private blocks: Bounds[]
    private grid: Grid
    private game_runner: GameRunner;
    constructor() {
        this.ball = new Ball()
        this.ball.bounds = new Bounds(100,300,10,10)
        this.ball.velocity = new Point(3,2)
        const BORDER_WIDTH = 20
        this.blocks = [
            new Bounds(0,0,SCREEN.w,BORDER_WIDTH),
            new Bounds(0,SCREEN.h-BORDER_WIDTH,SCREEN.w,BORDER_WIDTH),
            new Bounds(SCREEN.w-BORDER_WIDTH,BORDER_WIDTH,BORDER_WIDTH,SCREEN.h-1),
            new Bounds(0,BORDER_WIDTH,BORDER_WIDTH,SCREEN.h-BORDER_WIDTH-BORDER_WIDTH-2),
            // new Bounds( 250, 40, 20, 100),
        ]
        this.grid = new Grid(Math.floor((SCREEN.w-BORDER_WIDTH*6)/20),8, 20)
        this.grid.forEach((cell:Cell)=> cell.value = 1)
        this.grid.position = new Point(60,60)
    }

    attach(element: Element) {
        this.canvas = element as unknown as HTMLCanvasElement
    }
    tick() {
        this.update()
        this.draw()
    }
    start() {
        this.game_runner = new RequestAnimGameRunner()
        // this.game_runner = new SetIntervalTicker(100)
        this.game_runner.start(this)
    }

    private update() {
        let new_bounds = this.ball.bounds.add(this.ball.velocity)
        this.blocks.forEach(blk => {
            let r = check_collision_block(this.ball.bounds, blk, this.ball.velocity)
            if(r.collided) {
                //new bounds based on the fraction of velocity before hit the barrier
                new_bounds = this.ball.bounds.add(this.ball.velocity.scale(r.tvalue))
                //reflect velocity
                this.ball.velocity = this.ball.velocity.multiply(r.reflection)
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

    private draw() {
        let ctx = this.canvas.getContext('2d')
        ctx.save()
        ctx.translate(0.5,0.5)
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
        this.blocks.forEach(blk => {
            this.stroke_bounds(ctx,blk,'aqua')
        })

        // ball
        this.stroke_bounds(ctx,this.ball.bounds,'red')

        // grid
        this.grid.draw(ctx)

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

    private stroke_bounds(ctx: CanvasRenderingContext2D, ball: Bounds, color:string) {
        ctx.strokeStyle = color
        ctx.strokeRect(ball.x, ball.y, ball.w-1, ball.h-1)
    }

}

