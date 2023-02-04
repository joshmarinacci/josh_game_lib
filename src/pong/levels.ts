import {BrickGrid, Cell} from "./brickGrid.js";
import {GREEN, HSL, RED, RGB, WHITE, YELLOW} from "../color.js";
import {ArrayGrid, Point} from "josh_js_util";
import {lerp_hsl, lerp_rgb} from "../math.js";

export type Level = {
    grid: BrickGrid
    velocity: Point
}

function init_gradient(): Level {
    let grid = new BrickGrid(10, 5, 14)
    grid.forEach((cell: Cell, index) => {
        cell.value = 1
        cell.color = lerp_hsl(new HSL(0.0,1,0.5), new HSL(0.15,1,0.5), index.y / 4)
        cell.border = cell.color.darken()
    })
    grid.position = new Point(30, 30)
    return {
        velocity: new Point(50, -50),
        grid: grid
    }
}

function init_checkerboard(): Level {
    let grid = new BrickGrid(10, 8, 14)
    grid.forEach((cell: Cell, index) => {
        if ((index.x + index.y) % 2 === 0) {
            cell.value = 1
            cell.color = RED
            cell.border = RED
        } else {
            cell.value = 0
        }
    })
    grid.position = new Point(30, 30)
    return {
        velocity: new Point(60, -60),
        grid: grid
    }
}

function init_heart(): Level {
    let grid = new BrickGrid(9, 8, 14)
    grid.position = new Point(40, 10)
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
    let data = ArrayGrid.fromPattern<Cell>(pattern, (ch: string, index) => {
        return {
            value: ch === '.' ? 0 : 1,
            border: RED.darken(),
            color: RED,
        }
    })
    data.forEach((c, i) => grid.set_at(i.x, i.y, c))
    return {
        velocity: new Point(70, -70),
        grid: grid
    }
}

function init_double_hit(): Level {
    let grid = new BrickGrid(10, 4, 14)
    grid.forEach((cell, index) => {
        cell.value = 1
        cell.color = RED
        cell.border = WHITE
        if (index.y < 2) {
            cell.value = 2
            cell.color = GREEN
            cell.border = WHITE
        }
    })
    grid.position = new Point(30, 30)
    return {
        velocity: new Point(60, -60),
        grid: grid
    }
}

function init_indistructible(): Level {
    let grid = new BrickGrid(10, 2, 14)
    grid.forEach((cell, index) => {
        cell.value = 1
        cell.color = RED
        cell.border = WHITE
        if (index.y < 1) {
            cell.value = 3
            cell.color = new RGB(0.1, 0.1, 0.1)
            cell.border = WHITE
        }
    })
    grid.position = new Point(30, 30)
    return {
        velocity: new Point(60, -60),
        grid: grid
    }
}

export const LEVELS = [
    init_gradient(),
    init_heart(),
    init_checkerboard(),
    init_double_hit(),
    init_indistructible(),
]
