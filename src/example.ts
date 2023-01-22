/*


* calculate distance along the vector to the intersection
* normalize the new position along the intersection vector. test with giant steps.

* create a grid object that we can collide against. draws self as bricks.
* verify it works inside a maze inside the grid

* add angle adjustment if hits a moving object
* draw grid object and 'moving' object with different colors.


 */
import {Bounds, Point} from "./math.js";
import {GameRunner, RequestAnimGameRunner} from "./time.js";
import {check_collision_block} from "./physics.js";

class Ball {
    bounds:Bounds
    velocity:Point
}
type Cell = {
    value:number
    color:string
}

class Grid {
    private w: number;
    private h: number;
    private cells: Cell[];
    size: number;
    private timeout:number
    position: Point;

    constructor(w: number, h: number) {
        this.w = w
        this.h = h
        this.size = 40
        this.cells = []
        for(let j=0; j<this.h; j++) {
            for(let i=0; i<this.w; i++) {
                this.cells.push({
                    value:0,
                    color:'orange'
                })
            }
        }

        let cell = this.get_cell(0,2)
        cell.value = 1
        cell.color = 'blue'
        this.timeout = 0
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.position.x,this.position.y)
        for(let j=0; j<this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                let cell = this.get_cell(i,j)
                ctx.strokeStyle = cell.color
                let x = i*this.size
                let y = j*this.size
                let ww = this.size-2
                let hh = this.size-2
                ctx.strokeRect(x,y,ww,hh)
            }
        }
        ctx.restore()
    }


    get_cell(x: number, y: number):Cell {
        let n = y*this.w+x
        return this.cells[n]
    }

    get_cell_bounds(x: number, y: number):Bounds {
        return new Bounds(x*this.size,y*this.size,this.size,this.size).add(this.position)
    }

    public self_bounds() {
        return new Bounds(this.position.x,this.position.y,this.w*40,this.h*40)
    }
}

// function check_collision_grid(grid:Grid, ball: Bounds, v: Point):CollisionResult {
//     let bounds = grid.self_bounds()
//     let ball_new = ball.add(v)
//     if(!bounds.intersects(ball_new) && !bounds.intersects(ball)) {
//         // console.log("outside")
//         return {
//             collided:false
//         }
//     }
//
//     let c1 = new Point(ball_new.x+ball_new.w,ball_new.y).subtract(grid.position)
//     let c1a = new Point(Math.floor(c1.x/grid.size), Math.floor(c1.y/grid.size))
//     let cell = grid.get_cell(c1a.x,c1a.y)
//     if(cell.value == 0) {
//         return {
//             collided:false,
//         }
//     }
//     if(cell.value == 1) {
//         // if(this.timeout > 20) {
//         //     throw new Error("")
//         // }
//         // this.timeout += 1
//         // console.log('cell is full')
//         let cell_bounds = grid.get_cell_bounds(c1a.x,c1a.y)
//         console.log("cell",cell_bounds, cell_bounds.left())
//         console.log("ball",ball_new, ball_new.right())
//         if(ball_new.top() < cell_bounds.bottom()) {
//             // console.log("going up")
//             return {collided: true, direction: "up"}
//         }
//         if(ball_new.right() >= cell_bounds.left()) {
//             // console.log("to the right")
//             return {collided: true, direction: "right"}
//         }
//         return {
//             collided:false,
//             direction:"right"
//         }
//     }
//     return {
//         collided:false,
//         direction:"up",
//     }
// }

export class Example {
    private canvas: HTMLCanvasElement
    private ball: Ball
    private blocks: Bounds[]
    private grid: Grid
    private game_runner: GameRunner;
    constructor() {
        this.ball = new Ball()
        this.ball.bounds = new Bounds(100,150,30,30)
        this.ball.velocity = new Point(-7,5)
        this.blocks = [
            new Bounds(0,0,599,20),
            new Bounds(0,299-20,599,20),
            new Bounds(599-20,20,20,260-1),
            new Bounds(0,20,20,300-20-20-1),
            // new Bounds( 250, 40, 20, 100),
        ]
        this.grid = new Grid(4,4)
        this.grid.position = new Point(300,40)
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
        // let hit = false
        this.blocks.forEach(blk => {
            let r = check_collision_block(this.ball.bounds, blk, this.ball.velocity)
            if(r.collided) {
                //new bounds based on the fraction of velocity before hit the barrier
                new_bounds = this.ball.bounds.add(this.ball.velocity.scale(r.tvalue))
                //reflect velocity
                this.ball.velocity = this.ball.velocity.multiply(r.reflection)
                // this.game_runner.stop()
            }
        })
        // let r = check_collision_grid(this.grid,this.ball.bounds, this.ball.velocity)
        // if(r.collided) {
        //     console.log("collided with the grid")
        //     if(r.direction === 'right') {
        //         this.ball.velocity = new Point(-this.ball.velocity.x,this.ball.velocity.y)
        //         console.log("hit on right, flipping to the left")
        //         // console.log("new vel",this.ball.velocity)
        //         // console.log("ball bounds",this.ball.bounds)
        //         // this.running = false
        //     }
        //     hit = true
        // }
        // if(!hit) {
        this.ball.bounds = new_bounds
    }

    private draw() {
        let ctx = this.canvas.getContext('2d')
        ctx.save()
        ctx.translate(0.5,0.5)
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)

        // blocks
        this.blocks.forEach(blk => {
            this.stroke_bounds(ctx,blk,'aqua')
        })

        // ball
        this.stroke_bounds(ctx,this.ball.bounds,'red')

        // grid
        // this.grid.draw(ctx)

        // debug
        ctx.save()
        ctx.translate(30,this.canvas.height-100)
        ctx.fillStyle = 'white'
        ctx.font = '14px sans-serif'
        ctx.fillText(`v = ${this.ball.velocity.toString()}`, 0,0)
        ctx.fillText(`ball = ${this.ball.bounds.toString()}`, 0,0+20)
        ctx.restore()
        ctx.restore()
    }

    private stroke_bounds(ctx: CanvasRenderingContext2D, ball: Bounds, color:string) {
        ctx.strokeStyle = color
        ctx.strokeRect(ball.x, ball.y, ball.w-1, ball.h-1)
    }

}

