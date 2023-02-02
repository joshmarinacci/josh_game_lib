import {GameRunner, RequestAnimGameRunner, TickClient, TimeInfo} from "./time.js";
import {KeyboardSystem} from "./keyboard.js";
import {Bounds} from "./math.js";
import {check_collision_block} from "./physics.js";
import {RGB, rgb_to_string} from "./color";
import {Point, Size} from "josh_js_util";


/*


jump game.

you have a player you move with the arrow keys
jump with the space bar
stand on top of ground
can't jump unless on ground
barriers at end, can't go through them
block in the middle you can jump on but not pass through


 */
const SCALE = 3
const SCREEN = new Size(200,200)
const PARAMS = {
    GRAVITY: new Point(0,0.10),
    JUMP_VELOCITY: new Point(0, -4 ),
    FRICTION_SCALE: 0.8,
    MAX_RUN_SPEED: 1.5,
    MAX_FALL_SPEED: 2
}
const DEBUG = {
    GRID: true,
    METRICS: false,
    GRAVITY:true,
}

function fillBounds(ctx: CanvasRenderingContext2D, bounds: Bounds, red: string) {
    ctx.fillStyle = red
    ctx.fillRect(bounds.x,bounds.y,bounds.w,bounds.h)
}
function fillStrokeBounds(ctx: CanvasRenderingContext2D, bounds: Bounds, fill: string, stroke:string) {
    ctx.fillStyle = fill
    ctx.fillRect(bounds.x,bounds.y,bounds.w,bounds.h)
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.strokeRect(bounds.x,bounds.y,bounds.w,bounds.h)
}

class Player {
    bounds: Bounds;
    moveAccel: Point;
    gravity: Point;
    velocity: Point;
    standing: boolean;
    friction: number;
    constructor() {
        this.bounds = new Bounds(100,100,16,32)
        this.gravity = DEBUG.GRAVITY?PARAMS.GRAVITY:new Point(0,0)
        this.velocity = new Point(0,0)
        this.moveAccel = new Point(0,0)
        this.standing = false
        this.friction = PARAMS.FRICTION_SCALE
    }

    draw(time: TimeInfo, ctx: CanvasRenderingContext2D) {
        fillStrokeBounds(ctx,this.bounds,'orangered','darkred')
    }

    reset() {
        this.bounds = new Bounds(100,100,16,32)
        this.moveAccel = new Point(0,0)
        this.velocity = new Point(0,0)
    }
}
class Block {
    bounds: Bounds;
    constructor(bounds:Bounds) {
        this.bounds = bounds
    }

    draw(time: TimeInfo, ctx: CanvasRenderingContext2D) {
        fillStrokeBounds(ctx,this.bounds,'lightgreen','darkGreen')
        if(DEBUG.METRICS) {
            ctx.fillStyle = 'white'
            ctx.font = '6px sans-serif'
            ctx.fillText(this.bounds.toString(), this.bounds.x + 2, this.bounds.y + 10)
        }
    }
}

class Powerup {
    bounds: Bounds;
    constructor(bounds: Bounds) {
        this.bounds = bounds
    }
    draw(time: TimeInfo, ctx: CanvasRenderingContext2D) {
        fillStrokeBounds(ctx,this.bounds,'aqua','blue')
    }
}

class Enemy {
    bounds: Bounds;
    constructor(bounds: Bounds) {
        this.bounds = bounds
    }
    draw(time: TimeInfo, ctx: CanvasRenderingContext2D) {
        fillStrokeBounds(ctx,this.bounds,'orange','darkOrange')
    }
}

export class JumpExample implements TickClient {
    private canvas: HTMLCanvasElement
    private game_runner: GameRunner;
    private keyboard: KeyboardSystem;
    private player: Player;
    private blocks: Block[];
    private powerups: Powerup[];
    private enemies: Enemy[];
    constructor() {
        this.player = new Player()
        this.blocks = [
            new Block(new Bounds(0,0,16,SCREEN.h-16)),
            new Block(new Bounds(SCREEN.w-16+1,0,16,SCREEN.h-16)),
            new Block(new Bounds(0,SCREEN.h-16, SCREEN.w,16)),
            new Block(new Bounds(120,120,16*3,16)), //168
        ]
        this.powerups = [
            new Powerup(new Bounds(135,120-16,16,16))
        ]
        this.enemies = [
            new Enemy(new Bounds(30,SCREEN.h - 16 - 16,16,16))
        ]
    }

    attach(element: Element) {
        this.canvas = element as unknown as HTMLCanvasElement
        this.keyboard = new KeyboardSystem(this.canvas)
        window.addEventListener('load', () => {
            this.canvas.focus()
        })
    }
    tick(time:TimeInfo) {
        this.update(time)
        this.draw(time)
    }
    start() {
        this.game_runner = new RequestAnimGameRunner(1.0)
        // this.game_runner = new SetIntervalTicker(100)
        this.game_runner.start(this)
    }

    private update(time: TimeInfo) {
        this.player.moveAccel = new Point(0,0)

        if(this.keyboard.isPressed('ArrowRight')) {
            this.player.moveAccel = new Point(0.5,0)
        }
        if(this.keyboard.isPressed('ArrowLeft')) {
            this.player.moveAccel = new Point(-0.5,0)
        }
        if(this.keyboard.isPressed('Space')) {
            if(this.player.standing) {
                this.player.velocity = this.player.velocity.add(PARAMS.JUMP_VELOCITY)
                this.player.standing = false
            }
        }

        if(this.player.standing) {
            // on the ground
            // apply move left and right and friction
            this.player.velocity = this.player.velocity.add(this.player.gravity)
            this.player.velocity = this.player.velocity.add(this.player.moveAccel)
                .scale(this.player.friction)
        } else {
            // in the air
            // apply gravity
            this.player.velocity = this.player.velocity.add(this.player.gravity)
            // still move left and right but no friction
            this.player.velocity = this.player.velocity.add(this.player.moveAccel)
        }
        // restrict max horizontal speed
        this.player.velocity = this.player.velocity.clamp(
            new Point(-PARAMS.MAX_RUN_SPEED,-10),
            new Point(PARAMS.MAX_RUN_SPEED,PARAMS.MAX_FALL_SPEED))

        // if in the air
        let new_bounds = this.player.bounds.add(this.player.velocity)
        let hit_something = false
        this.powerups.forEach(powerup => {
            let hit = check_collision_block(this.player.bounds, powerup.bounds, this.player.velocity)
            if (hit.collided) {
                this.powerups = this.powerups.filter(p => p !== powerup)
            }
        })
        for(let enemy of this.enemies) {
            let hit = check_collision_block(this.player.bounds, enemy.bounds, this.player.velocity)
            if (hit.collided) {
                // move player back to starting point
                this.player.reset()
                return
            }
        }
        this.blocks.forEach(blk => {
            let hit= check_collision_block(this.player.bounds,blk.bounds,this.player.velocity)
            if(hit.collided) {
                // console.log("hit", hit.direction)
                // adjust to the block and set velocity back to zero
                if(hit.direction === 'left' || hit.direction === 'right') {
                    // if hit horizontally
                    // only stop the horizontal motion
                    this.player.velocity = new Point(0,this.player.velocity.y)
                }
                new_bounds = this.player.bounds.add(this.player.velocity.scale(hit.tvalue))
                if(hit.direction === 'down') {
                    // if hit ground and already standing, do nothing
                    // if hit vertically down. stop and stand
                    this.player.velocity = new Point(this.player.velocity.x, 0)
                    if(this.player.standing) {
                        new_bounds = this.player.bounds.add(this.player.velocity)
                    } else {
                        this.player.standing = true
                    }
                }
                if(hit.direction === 'up') {
                    //if hit up, stop vertical velocity, but still fall down
                    this.player.velocity = new Point(this.player.velocity.x,0)
                }
                hit_something = true
            }
        })
        if(!hit_something) {
            this.player.standing = false
        }
        this.player.bounds = new_bounds
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

        this.player.draw(time,ctx)
        this.powerups.forEach(power => power.draw(time,ctx))
        this.enemies.forEach(enem => enem.draw(time,ctx))
        this.blocks.forEach(blk => blk.draw(time,ctx))

        if(DEBUG.METRICS) {
            // debug
            ctx.save()
            ctx.translate(30, SCREEN.h - 100)
            ctx.fillStyle = 'white'
            ctx.font = '6px sans-serif'
            // ctx.fillText(`v = ${this.ball.velocity.toString()}`, 0, 0)
            ctx.fillText(`player = ${this.player.bounds.toString()}`, 0, 0 + 20)
            ctx.fillText(`player = ${this.player.velocity.toString()}`, 0, 0 + 30)
            ctx.fillText(`standing ${this.player.standing}`,0,0+40)
            ctx.restore()
        }
        ctx.restore()
    }
}
