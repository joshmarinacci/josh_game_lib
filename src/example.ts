/*


* calculate distance along the vector to the intersection
* normalize the new position along the intersection vector. test with giant steps.

* create a grid object that we can collide against. draws self as bricks.
* verify it works inside a maze inside the grid

* add angle adjustment if hits a moving object
* draw grid object and 'moving' object with different colors.


 */
import {Bounds, Point} from "./math.js";
import {GameRunner, RequestAnimGameRunner, SetIntervalTicker} from "./time.js";
import {check_collision_block, CollisionResult} from "./physics.js";

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

        this.get_cell(0,2).value = 1
        this.get_cell(3,1).value = 1
        this.get_cell(3,3).value = 1
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.position.x,this.position.y)
        for(let j=0; j<this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                let cell = this.get_cell(i,j)
                ctx.strokeStyle = cell.value === 0?"orange":"blue"
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
        if(x < 0) return undefined
        if(y < 0) return undefined
        if(x >= this.w) return undefined
        if(y >= this.h) return undefined
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

function check_collision_grid(grid:Grid, old_ball: Bounds, v: Point):CollisionResult {
    let bounds = grid.self_bounds()
    let new_ball = old_ball.add(v)
    if(!bounds.intersects(new_ball) && !bounds.intersects(old_ball)) {
        return {
            collided:false
        }
    }
//
    function check_collision_grid_corner(grid:Grid, corner:Point) {
        let cell_coords = corner.subtract(grid.position).scale(1/grid.size).floor()
        let cell = grid.get_cell(cell_coords.x,cell_coords.y)
        if(cell) {
            if(cell.value == 0)  return { collided:false  }
            if(cell.value == 1) {
                let cell_bounds = grid.get_cell_bounds(cell_coords.x, cell_coords.y)
                return check_collision_block(old_ball, cell_bounds, v)
            }
        }
        return { collided: false }
    }

    let r1 = check_collision_grid_corner(grid, new_ball.top_right())
    if(r1.collided) return r1
    let r2 = check_collision_grid_corner(grid, new_ball.bottom_right())
    if(r2.collided) return r2
    let r3 = check_collision_grid_corner(grid, new_ball.bottom_left())
    if(r3.collided) return r3
    let r4 = check_collision_grid_corner(grid, new_ball.top_left())
    if(r4.collided) return r4

    return {
        collided:false,
    }
}

export class Example {
    private canvas: HTMLCanvasElement
    private ball: Ball
    private blocks: Bounds[]
    private grid: Grid
    private game_runner: GameRunner;
    constructor() {
        this.ball = new Ball()
        this.ball.bounds = new Bounds(100,150,20,20)
        this.ball.velocity = new Point(13,10)
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

        for(let i=0; i<=this.canvas.width; i+=100) {
            ctx.beginPath()
            ctx.moveTo(i,0)
            ctx.lineTo(i,this.canvas.height-1)
            ctx.strokeStyle = '#222222'
            ctx.stroke()
        }
        for(let j=0; j<=this.canvas.height; j+=100) {
            ctx.beginPath()
            ctx.moveTo(0,j)
            ctx.lineTo(this.canvas.width-1,j)
            ctx.strokeStyle = '#222222'
            ctx.stroke()
        }

        // blocks
        this.blocks.forEach(blk => {
            this.stroke_bounds(ctx,blk,'aqua')
        })

        // ball
        this.stroke_bounds(ctx,this.ball.bounds,'red')

        // grid
        this.grid.draw(ctx)

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

