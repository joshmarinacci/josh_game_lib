import {Bounds} from "./math.js";
import {check_collision_block, CollisionResult} from "./physics.js";
import {darken, RED, RGB, rgb_to_string} from "./color.js";
import {ArrayGrid, Point} from "josh_js_util";

export type Cell = {
    value: number
    color: RGB
    border: RGB
}

export class Grid extends ArrayGrid<Cell> {
    draw_size: number;
    position: Point;
    constructor(w:number, h:number, size:number) {
        super(w,h)
        this.draw_size = size
        this.position = new Point(0,0)
        this.fill((xy) => {
            return {
                value: 0,
                color: RED,
                border: darken(RED)
            }
        });
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        for (let j = 0; j < this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                let cell = this.get_at(i, j)
                if(cell.value === 0) continue
                let x = i * this.draw_size
                let y = j * this.draw_size
                let ww = this.draw_size - 2
                let hh = this.draw_size - 2
                ctx.fillStyle = rgb_to_string(cell.color)
                ctx.fillRect(x,y,ww,hh)
                ctx.strokeStyle = rgb_to_string(cell.border)
                ctx.lineWidth = 1
                ctx.strokeRect(x, y, ww, hh)
            }
        }
        ctx.restore()
    }
    get_cell_bounds(x: number, y: number): Bounds {
        return new Bounds(x * this.draw_size, y * this.draw_size, this.size, this.size).add(this.position)
    }

    public self_bounds() {
        return new Bounds(this.position.x, this.position.y, this.w * 40, this.h * 40)
    }
}

type CellCallback<C> = (cell:C, coords:Point) => void

export function check_collision_grid(grid: Grid, old_ball: Bounds, v: Point): CollisionResult {
    let bounds = grid.self_bounds()
    let new_ball = old_ball.add(v)
    if (!bounds.intersects(new_ball) && !bounds.intersects(old_ball)) {
        return {
            collided: false
        }
    }

//
    function check_collision_grid_corner(grid: Grid, corner: Point) {
        let cell_coords = corner.subtract(grid.position).scale(1 / grid.draw_size).floor()
        let cell = grid.get_at(cell_coords.x, cell_coords.y)
        if (cell) {
            if (cell.value == 0) return {collided: false}
            if (cell.value >= 1) {
                let cell_bounds = grid.get_cell_bounds(cell_coords.x, cell_coords.y)
                let r = check_collision_block(old_ball, cell_bounds, v)
                if(r.collided) {
                    r.target = cell
                    return r
                }
            }
        }
        return {collided: false}
    }

    let r1 = check_collision_grid_corner(grid, new_ball.top_right())
    if (r1.collided) return r1
    let r2 = check_collision_grid_corner(grid, new_ball.bottom_right())
    if (r2.collided) return r2
    let r3 = check_collision_grid_corner(grid, new_ball.bottom_left())
    if (r3.collided) return r3
    let r4 = check_collision_grid_corner(grid, new_ball.top_left())
    if (r4.collided) return r4

    return {
        collided: false,
    }
}


type CellCallback2<C> = (ch:string, coords:Point) => C
