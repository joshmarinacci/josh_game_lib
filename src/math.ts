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
}

export function rand(min: number, max: number) {
    return min + Math.random()*(max-min)
}

