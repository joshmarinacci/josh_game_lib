/*


- [ ] find all objects that intersect with the ball
- [ ] sort them by collision distance
- [ ] calculate reflection angle
- [ ] calculate new position
- [ ] calculate new velocity (with random adjustment)
- [ ] Make unit tests for collision code
- [ ] Make stub app that just moves and draws rects, including the game board edges.



make a ball and 4 rects


 */
import {Bounds, Point} from "./math.js";

class Ball {
    bounds:Bounds
    velocity:Point
}
export class Example {
    private canvas: HTMLCanvasElement;
    private ball: Ball;
    private blocks: Bounds[];
    private running: boolean;
    private handle: number;
    constructor() {
        this.running = false
        this.ball = new Ball()
        this.ball.bounds = new Bounds(50,50,30,30)
        this.ball.velocity = new Point(4,-6)
        this.blocks = [
            new Bounds(0,0,599,20),
            new Bounds(0,299-20,599,20),
            new Bounds(599-20,20,20,260-1),
            new Bounds(0,20,20,300-20-20-1),
            new Bounds( 150, 100, 20, 20),
        ]
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
            let r = this.check_collision(this.ball.bounds, blk, this.ball.velocity)
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
        if(!hit) {
            this.ball.bounds = new_bounds
        }
    }

    private draw() {
        let ctx = this.canvas.getContext('2d')
        ctx.save()
        ctx.translate(0.5,0.5)
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        this.stroke_bounds(ctx,this.ball.bounds)
        this.blocks.forEach(blk => {
            this.stroke_bounds(ctx,blk)
        })
        ctx.restore()
    }

    private stroke_bounds(ctx: CanvasRenderingContext2D, ball: Bounds) {
        ctx.strokeStyle = 'red'
        ctx.strokeRect(ball.x, ball.y, ball.w, ball.h)
    }

    private check_collision(src: Bounds, target: Bounds, v: Point):CollisionResult {
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
}

type CollisionResult = {
    collided:boolean
    direction?: "up"|"down"|"left"|"right"|undefined
}
