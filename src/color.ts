export type RGB = {
    r: number
    g: number
    b: number
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
