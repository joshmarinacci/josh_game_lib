import {HSL, RGB} from "./color.js";

export function lerp_rgb(s: RGB, e: RGB, t: number): RGB {
    return s.lerp(t,e)
}
export function lerp_hsl(s: HSL, e: HSL, t: number): HSL {
    return s.lerp(t,e)
}

