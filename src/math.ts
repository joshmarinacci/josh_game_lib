import {RGB} from "./color";

export class Point {
    readonly y: number;
    readonly x: number;
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
    add(pt:Point) {
        return new Point(this.x+pt.x,this.y+pt.y)
    }
    scale(v:number) {
        return new Point(this.x*v,this.y*v)
    }

    subtract(pt: Point) {
        return new Point(this.x-pt.x,this.y-pt.y)
    }
    toString() {
        return `Point(${this.x.toFixed(1)},${this.y.toFixed(1)})`
    }

    length() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    multiply(point: Point):Point {
        return new Point(this.x*point.x,this.y*point.y)
    }

    floor():Point {
        return new Point(Math.floor(this.x),Math.floor(this.y))
    }

    clamp(min: Point, max: Point):Point {
        let x = this.x
        if(x < min.x) x = min.x
        if(x > max.x) x = max.x
        let y = this.y
        if(y < min.y) y = min.y
        if(y > max.y) y = max.y
        return new Point(x,y)
    }

    copy() {
        return new Point(this.x,this.y)
    }
}
export class Size {
    readonly w: number;
    readonly h: number;
    constructor(w:number, h:number) {
        this.w = w
        this.h = h
    }
}

export class Insets {
    top:number
    right:number
    bottom:number
    left:number
    constructor(top,right,bottom,left) {
        this.top = top
        this.right = right
        this.bottom = bottom
        this.left = left
    }
}
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

export function rand(min: number, max: number) {
    return min + Math.random()*(max-min)
}

function lerp(s: number, e: number, t: number): number {
    if (t <= 0) return s
    if (t >= 1) return e
    return s + (e - s) * t
}

export function lerp_rgb(s: RGB, e: RGB, t: number): RGB {
    return {
        r: lerp(s.r, e.r, t),
        g: lerp(s.g, e.g, t),
        b: lerp(s.b, e.b, t),
    }
}
