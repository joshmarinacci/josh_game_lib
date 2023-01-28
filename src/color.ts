export type RGB = {
    r: number
    g: number
    b: number
}

export function darken(rgb:RGB):RGB {
    return {
        r:rgb.r*0.8,
        g:rgb.g*0.8,
        b:rgb.b*0.8
    }
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

export const RED: RGB = {r: 1, g: 0, b: 0}
export const BLACK: RGB = {r: 0, g: 0, b: 0}
export const WHITE: RGB = {r: 1, g: 1, b: 1}
export const VIOLET: RGB = {r: 0.3, g: 0, b: 0.8}
export const YELLOW: RGB = {r: 1.0, g: 0.8, b: 0.1}
