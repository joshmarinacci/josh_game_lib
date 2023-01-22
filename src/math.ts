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
        return `Point(${this.x},${this.y})`
    }

    length() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    multiply(point: Point) {
        return new Point(this.x*point.x,this.y*point.y)
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

    intersects(rect2: Bounds) {
        if(this.left() > rect2.right()) return false
        if(this.right() < rect2.left()) return false
        if(this.top() > rect2.bottom()) return false
        if(this.bottom() < rect2.top()) return false

        // console.log("checking",rect2)
        return true
    }
    toString() {
        return `(${this.x},${this.y})x(${this.w},${this.h})`
    }
}

export function rand(min: number, max: number) {
    return min + Math.random()*(max-min)
}

