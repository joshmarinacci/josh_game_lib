import {lerp_number} from "./math.js";

export class RGB {
    r: number
    g: number
    b: number
    constructor(r:number, g:number, b:number) {
        this.r = r
        this.g = g
        this.b = b
    }
    lerp(t:number, that:RGB):RGB {
        return new RGB(
            lerp_number(t,this.r,that.r),
            lerp_number(t,this.g,that.g),
            lerp_number(t,this.b,that.b),
        )
    }
}

export function darken(rgb:RGB):RGB {
    return new RGB(
        rgb.r*0.8,
        rgb.g*0.8,
        rgb.b*0.8
    )
}

export function rgb_to_string(rgb: RGB) {
    let r = Math.floor(rgb.r * 255)
    let g = Math.floor(rgb.g * 255)
    let b = Math.floor(rgb.b * 255)
    return `rgb(${r} ${g} ${b})`
}

export function rgb_to_string_with_alpha(rgb: RGB, alpha: number) {
    let r = (rgb.r * 100).toFixed(0)
    let g = (rgb.g * 100).toFixed(0)
    let b = (rgb.b * 100).toFixed(0)
    let a = (alpha * 100).toFixed(0)
    return `rgb(${r}% ${g}% ${b}% / ${a}%)`
}

export const RED:   RGB = new RGB(1,0,0);
export const GREEN: RGB = new RGB(0,1,0)
export const BLUE:  RGB = new RGB(0,0,1)
export const BLACK: RGB = new RGB(0,0,0)
export const WHITE: RGB = new RGB(1,1,1)
export const VIOLET: RGB = new RGB(0.3,0,0.8)
export const YELLOW: RGB = new RGB(1,0.8,0.1)
