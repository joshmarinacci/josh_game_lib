/*

make game reset when grid cleared with different sets of levels
make 3 levels using the same basic grid, but start off with them bigger then become
smaller?

level 1: 10 x 3. 50pps, pure blue
level 2: 10 x 4. 60pps, gradient of blue to green
level 3: 9 x 7 red heart, 70pps

111116JF2KzyFRG2qu7K9JejxwSqeeqc6p3PdyvDLdNR3X67xiPLegK1pEcrv38Z6pGRHnkujHfbKAznPcJ7WN7XmfBhh7X12sCyPrGyuye75YHMGhxZ6Ghm

 */
import {Bounds, lerp_rgb, Point, Size} from "./math.js";
import {GameRunner, RequestAnimGameRunner, TickClient, TimeInfo} from "./time.js";
import {check_collision_block} from "./physics.js";
import {Cell, check_collision_grid, Grid} from "./grid.js";
import {KeyboardSystem} from "./keyboard.js";
import {Fader, ParticleEffect, Wiggle} from "./effects.js";
import {BLACK, darken, RED, RGB, rgb_to_string, VIOLET, WHITE, YELLOW} from "./color.js";

// @ts-ignore
const sfxr = window.sfxr
const thunk = sfxr.toAudio("5EoyNVSymuxD8s7HP1ixqdaCn5uVGEgwQ3kJBR7bSoApFQzm7E4zZPW2EcXm3jmNdTtTPeDuvwjY8z4exqaXz3NGBHRKBx3igYfBBMRBxDALhBSvzkF6VE2Pv");
thunk.setVolume(0.3)
const shink = sfxr.toAudio("1111183hPJjHhxh1JS7tXZgQ2zVBcM8SwCrDSXmAm5dEVyxckp8SxyDpwFJvkjK1kDzZswufTq2kR4kjnQPgee4mJc1q6Tor9rP47ssgZtfkBnndAnSMMSfZ")
shink.setVolume(0.3)
const punch = sfxr.toAudio("7BMHBGFN3zeFYKifK1UC1EMF2VpPaNsHXx9CPLmETvKoJvo1sZGDs9f2jrB99VNngrwh9W2tQHgWcTGzHMyiADxLftDyqML91B9arfPzJq6ZPuVCqKwbRJHuH")
punch.setVolume(0.3)

const sound_track = "https://www.beepbox.co/#9n31s0k0l00e03t2ma7g0fj07r1i0o432T1v1uc0f10l7q011d23A4F3B5Q0506Pd474E361963279T0v1u58f0q0x10ob1d03w5h1E1b7T1v1u3df0qwx10p511d08AcFbBfQ269cP969bE2bi7iT4v1uf0f0q011z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00E0b4h400000000h4g000000014h000000004h400000000p1WBWqfibSqfVgzjhWhvgnVBpp60BWqfijtfMs600aqcMnQ5Z17ghQ4t5B960"


const DEFAULT_BALL_BOUNDS = new Bounds(50,150,5,5)
const DEFAULT_BALL_VELOCITY = new Point(50,-50) // speed in pixels per second
class Ball {
    bounds:Bounds
    velocity:Point
    fader:Fader
    constructor() {
        this.fader = new Fader(new RGB(0.9,0,0),YELLOW,0.150)
        this.bounds = DEFAULT_BALL_BOUNDS.copy()
        this.velocity = DEFAULT_BALL_VELOCITY
    }
}

class Paddle {
    bounds:Bounds
    velocity: Point;
    constructor() {
        this.bounds = new Bounds(50,160,50,10)
        this.velocity = new Point(150,0) // in pixels per second
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'blue'
        ctx.fillRect(this.bounds.x,this.bounds.y,this.bounds.w,this.bounds.h)
    }
}

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
    METRICS: false,
    PARTICLES: true,
    SOUND_EFFECTS:false,
    MUSIC:false,
}
const SCREEN = new Size(200,200)
const SCALE = 3

const BORDER_WIDTH = 10

type Level = {
    grid:Grid
    velocity:Point
}

function init_gradient():Level {
    let grid = new Grid(10,5, 14)
    grid.forEach((cell: Cell, index:Point) => {
        cell.value = 1
        cell.color = lerp_rgb(RED,YELLOW,index.y/4)
        cell.border = darken(cell.color)
    })
    grid.position = new Point(30,30)
    return {
        velocity: new Point(50,-50),
        grid: grid
    }
}
function init_checkerboard():Level {
    let grid = new Grid(10,8, 14)
    grid.forEach((cell: Cell, index:Point) => {
        if((index.x + index.y) % 2 === 0) {
            cell.value = 1
            cell.color = RED
            cell.border = RED
        } else {
            cell.value = 0
        }
    })
    grid.position = new Point(30,30)
    return {
        velocity: new Point(60,-60),
        grid: grid
    }
}
function init_heart():Level {
    let grid = new Grid(9,8, 14)
    grid.position = new Point(40,10)
    let pattern = `
    ..XX.XX..
    .XXXXXXX.
    XXXXXXXXX
    XXXXXXXXX
    XXXXXXXXX
    .XXXXXXX.
    ..XXXXX..
    ...XXX...
    `
    let lines =  pattern.trim().split('\n')
    let y = 0
    for(let line of lines) {
        line = line.trim()
        let x = 0
        for(let ch of line) {
            let cell = grid.get_cell(x,y)
            if(ch === '.') {
                cell.value = 0
            } else {
                cell.value = 1
            }
            x++
        }
        y++
    }
    return {
        velocity: new Point(70,-70),
        grid: grid
    }
}

const LEVELS = [
    init_heart(),
    init_checkerboard(),
    init_gradient(),
]


function play_effect(thunk: any) {
    if(DEBUG.SOUND_EFFECTS) thunk.play()
}

export class PongExample implements TickClient {
    private canvas: HTMLCanvasElement
    private ball: Ball
    private blocks: Bumper[]
    private grid: Grid
    private game_runner: GameRunner;
    private paddle: Paddle;
    private keyboard: KeyboardSystem;
    private particles: ParticleEffect[];
    private levels: Level[];
    private levelIndex: number;
    private level: Level;
    constructor() {
        this.ball = new Ball()
        this.paddle = new Paddle()
        const top_bumper = new Bumper(0,0,SCREEN.w,BORDER_WIDTH)
        const right_bumper = new Bumper(SCREEN.w-BORDER_WIDTH,BORDER_WIDTH,
            BORDER_WIDTH,SCREEN.h-BORDER_WIDTH*2)
        right_bumper.wiggle.offset = new Point(2,0)
        const left_bumper = new Bumper(0,BORDER_WIDTH,
            BORDER_WIDTH,SCREEN.h-BORDER_WIDTH-BORDER_WIDTH)
        left_bumper.wiggle.offset = new Point(2,0)

        this.blocks = [top_bumper,right_bumper,left_bumper]
        this.levels = LEVELS
        this.levelIndex = 0
        this.level = this.levels[this.levelIndex]
        this.grid = this.level.grid

        this.particles = []
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
        this.check_die(time)
        this.check_win(time)
        this.draw(time)
    }
    start() {
        this.game_runner = new RequestAnimGameRunner(1)
        // this.game_runner = new SetIntervalTicker(100)
        this.game_runner.start(this)
    }

    private update(time: TimeInfo) {
        if(this.keyboard.isPressed('ArrowRight')) {
            let delta = this.paddle.velocity.scale(1*time.delta)
            this.paddle.bounds.add_self(delta)
            if(this.paddle.bounds.right() > SCREEN.w - BORDER_WIDTH) {
                this.paddle.bounds.set_right(SCREEN.w - BORDER_WIDTH)
            }
        }
        if(this.keyboard.isPressed('ArrowLeft')) {
            let delta = this.paddle.velocity.scale(-1*time.delta)
            this.paddle.bounds.add_self(delta)
            // this.paddle.bounds.add_self(new Point(-3,0))
            if(this.paddle.bounds.left() < BORDER_WIDTH) {
                this.paddle.bounds.set_left(BORDER_WIDTH)
            }
        }
        // console.log('delta',time.delta)
        let velocity = this.ball.velocity.scale(time.delta)
        let new_bounds = this.ball.bounds.add(velocity)
        //hit paddle
        let r3 = check_collision_block(this.ball.bounds,this.paddle.bounds,velocity)
        if(r3.collided) {
            new_bounds = this.ball.bounds.add(velocity.scale(r3.tvalue))
            //reflect velocity vector
            this.ball.velocity = this.ball.velocity.multiply(r3.reflection)
            this.ball.fader.start()
            play_effect(thunk)
        }
        this.blocks.forEach(bumper => {
            let blk = bumper.bounds
            let r = check_collision_block(this.ball.bounds, blk, velocity)
            if(r.collided) {
                play_effect(shink)
                //new bounds based on the fraction of velocity before hit the barrier
                new_bounds = this.ball.bounds.add(velocity.scale(r.tvalue))
                //reflect velocity
                this.ball.velocity = this.ball.velocity.multiply(r.reflection)
                this.ball.fader.start()
                bumper.fade.start()
                bumper.wiggle.start()
            }
        })
        let r = check_collision_grid(this.grid,this.ball.bounds, velocity)
        if(r.collided) {
            new_bounds = this.ball.bounds.add(velocity.scale(r.tvalue))
            this.ball.velocity = this.ball.velocity.multiply(r.reflection)
            let cell = r.target as Cell
            // hide the cell
            cell.value = 0
            // add a particle effect
            this.particles.push(new ParticleEffect({
                count: 30,
                position:this.ball.bounds.center(),
                color: new RGB(252/255, 147/255, 230/255),
            }))
            play_effect(punch)
        }
        this.ball.bounds = new_bounds

        if(DEBUG.PARTICLES) this.particles.forEach(part => part.update(time))
        if(DEBUG.PARTICLES) this.particles = this.particles.filter(part => part.isAlive())
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

        if(DEBUG.PARTICLES) this.particles.forEach(part => part.draw(time,ctx))

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

    private check_win(time: TimeInfo) {
        let count = 0
        this.grid.forEach((cell)=>{
            count += cell.value
        })
        if(count <= 0) {
            this.go_next_level()
        }
    }

    private go_next_level() {
        this.levelIndex = this.levelIndex+1
        console.log("new level",this.levelIndex)
        if(this.levelIndex >= this.levels.length) {
            this.win_game()
        } else {
            this.level = this.levels[this.levelIndex]
            this.grid = this.level.grid
            this.reset_ball()
        }
    }

    private reset_ball() {
        this.ball.bounds = DEFAULT_BALL_BOUNDS.copy()
        this.ball.velocity = this.level.velocity.copy()
    }

    private check_die(time: TimeInfo) {
        if(this.ball.bounds.y > SCREEN.h) {
            console.log("died")
            this.reset_ball()
        }

    }

    private win_game() {
        console.log("you won the game")
        this.game_runner.stop()
    }
}

