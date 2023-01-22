/*


* calculate distance along the vector to the intersection
* normalize the new position along the intersection vector. test with giant steps.

* create a grid object that we can collide against. draws self as bricks.
* verify it works inside a maze inside the grid

* add angle adjustment if hits a moving object
* draw grid object and 'moving' object with different colors.


 */
import {Bounds, Point, Size} from "./math.js";

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

function check_collision_grid(grid:Grid, ball: Bounds, v: Point):CollisionResult {
    let bounds = grid.self_bounds()
    let ball_new = ball.add(v)
    if(!bounds.intersects(ball_new) && !bounds.intersects(ball)) {
        // console.log("outside")
        return {
            collided:false
        }
    }

    let c1 = new Point(ball_new.x+ball_new.w,ball_new.y).subtract(grid.position)
    let c1a = new Point(Math.floor(c1.x/grid.size), Math.floor(c1.y/grid.size))
    let cell = grid.get_cell(c1a.x,c1a.y)
    if(cell.value == 0) {
        return {
            collided:false,
        }
    }
    if(cell.value == 1) {
        // if(this.timeout > 20) {
        //     throw new Error("")
        // }
        // this.timeout += 1
        // console.log('cell is full')
        let cell_bounds = grid.get_cell_bounds(c1a.x,c1a.y)
        console.log("cell",cell_bounds, cell_bounds.left())
        console.log("ball",ball_new, ball_new.right())
        if(ball_new.top() < cell_bounds.bottom()) {
            // console.log("going up")
            return {collided: true, direction: "up"}
        }
        if(ball_new.right() >= cell_bounds.left()) {
            // console.log("to the right")
            return {collided: true, direction: "right"}
        }
        return {
            collided:false,
            direction:"right"
        }
    }
    return {
        collided:false,
        direction:"up",
    }
}

function check_collision_block(src: Bounds, target: Bounds, v: Point):CollisionResult {
    if(src.intersects(target)) {
        console.log("already inside!")
        return {
            collided:true
        }
    }
    let b2 = src.add(v)
    if(b2.intersects(target)) {
        if(src.top() > target.bottom()) {
            return { collided:true, direction:"up", }
        }
        if(src.bottom() < target.top()) {
            return { collided:true, direction:"down", }
        }

        if(src.left() > target.right()) {
            return { collided:true, direction:"left", }
        }
        if(src.right() < target.left()) {
            return { collided: true, direction:"right" }
        }
    }
    return {
        collided:false
    }
}

export class Example {
    private canvas: HTMLCanvasElement
    private ball: Ball
    private blocks: Bounds[]
    private grid: Grid
    private running: boolean
    private handle: number
    constructor() {
        this.running = false
        this.ball = new Ball()
        this.ball.bounds = new Bounds(50,50,30,30)
        this.ball.velocity = new Point(3,20)
        this.blocks = [
            new Bounds(0,0,599,20),
            new Bounds(0,299-20,599,20),
            new Bounds(599-20,20,20,260-1),
            new Bounds(0,20,20,300-20-20-1),
            new Bounds( 150, 100, 20, 20),
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
        if(this.running) requestAnimationFrame(() => this.tick())
    }
    start() {
        this.running = true
        requestAnimationFrame(() => this.tick())
        // this.handle = setInterval(() => {
        //     this.tick()
        //     if(!this.running) {
        //         clearInterval(this.handle)
        //     }
        // },10)
    }

    private update() {
        let new_bounds = this.ball.bounds.add(this.ball.velocity)
        let hit = false
        this.blocks.forEach(blk => {
            let r = check_collision_block(this.ball.bounds, blk, this.ball.velocity)
            if(r.collided) {
                // console.log("collision",r)
                // this.running = false
                if(r.direction === 'up') {
                    this.ball.velocity = new Point(this.ball.velocity.x,-this.ball.velocity.y)
                }
                if(r.direction === 'down') {
                    this.ball.velocity = new Point(this.ball.velocity.x,-this.ball.velocity.y)
                }
                if(r.direction === 'right') {
                    this.ball.velocity = new Point(-this.ball.velocity.x,this.ball.velocity.y)
                }
                if(r.direction === 'left') {
                    this.ball.velocity = new Point(-this.ball.velocity.x,this.ball.velocity.y)
                }
                hit = true
            }
        })
        let r = check_collision_grid(this.grid,this.ball.bounds, this.ball.velocity)
        if(r.collided) {
            console.log("collided with the grid")
            if(r.direction === 'right') {
                this.ball.velocity = new Point(-this.ball.velocity.x,this.ball.velocity.y)
                console.log("hit on right, flipping to the left")
                // console.log("new vel",this.ball.velocity)
                // console.log("ball bounds",this.ball.bounds)
                // this.running = false
            }
            hit = true
        }
        if(!hit) {
            this.ball.bounds = new_bounds
        }
        console.log("ball bounds",this.ball.bounds, this.ball.bounds.right())
        console.log("grid bounds",this.grid.self_bounds())
    }

    private draw() {
        let ctx = this.canvas.getContext('2d')
        ctx.save()
        ctx.translate(0.5,0.5)
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        this.stroke_bounds(ctx,this.ball.bounds,'red')
        this.blocks.forEach(blk => {
            this.stroke_bounds(ctx,blk,'aqua')
        })
        this.grid.draw(ctx)

        ctx.save()
        ctx.translate(50,50)
        ctx.fillStyle = 'white'
        ctx.font = '14px sans-serif'
        ctx.fillText(this.ball.velocity.toString(), 0,0)
        ctx.fillText(this.ball.bounds.toString(), 0,0+20)
        ctx.restore()
        ctx.restore()
    }

    private stroke_bounds(ctx: CanvasRenderingContext2D, ball: Bounds, color:string) {
        ctx.strokeStyle = color
        ctx.strokeRect(ball.x, ball.y, ball.w, ball.h)
    }

}

type CollisionResult = {
    collided:boolean
    direction?: "up"|"down"|"left"|"right"|undefined
}
