import {HSL, RGB} from "./color.js";
import {Point, Insets} from "josh_js_util"

export class Bounds {
    x: number;
    y: any;
    w: any;
    h: any;
    constructor(x: number, y, w,h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    set(number: number, number2: number, number3: number, h: number) {
        this.x = number
        this.y = number2
        this.w = number3
        this.h = h
    }

    add_self(point: Point) {
        this.x += point.x
        this.y += point.y
    }

    add(point: Point) {
        return new Bounds(this.x+point.x,this.y+point.y,this.w,this.h)
    }

    bottom() {
        return this.y + this.h
    }

    left() {
        return this.x
    }

    right() {
        return this.x + this.w
    }

    top() {
        return this.y
    }

    center() {
        return new Point(this.x+this.w/2, this.y+this.h/2)
    }

    intersects(other: Bounds) {
        if(this.left() >= other.right()) return false
        if(this.right() <= other.left()) return false
        if(this.top() >= other.bottom()) return false
        if(this.bottom() <= other.top()) return false
        return true
    }
    toString() {
        return `(${this.x.toFixed(1)},${this.y.toFixed(1)})x(${this.w.toFixed(1)},${this.h.toFixed(1)})`
    }

    top_right():Point {
        return new Point(this.x+this.w,this.y)
    }

    bottom_right() {
        return new Point(this.x+this.w,this.y+this.h)
    }

    bottom_left() {
        return new Point(this.x,this.y+this.h)
    }

    top_left() {
        return new Point(this.x,this.y)
    }

    copy() {
        return new Bounds(this.x,this.y,this.w,this.h)
    }

    set_left(left: number) {
        this.x = left
    }

    set_right(right: number) {
        this.x = right - this.w
    }

    private sides():Insets {
        return new Insets(
            this.top(),
            this.right(),
            this.bottom(),
            this.left()
        )
    }
}

export function lerp_rgb(s: RGB, e: RGB, t: number): RGB {
    return s.lerp(t,e)
}
export function lerp_hsl(s: HSL, e: HSL, t: number): HSL {
    return s.lerp(t,e)
}

