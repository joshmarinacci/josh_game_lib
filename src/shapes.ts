import {RED, RGB} from "./color.js";
import {Point} from "./math.js";

export abstract class Shape {
    color: RGB;
    position: Point;
    alpha: number;
    scale: number;
    rotate: number;

    constructor() {
        this.position = new Point(0, 0)
        this.scale = 1.0
        this.rotate = 0.0
        this.color = RED
        this.alpha = 1.0
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}
