import {Bounds} from "./math.js";
import {Point} from "josh_js_util";

export type CollisionResult = {
    collided: boolean
    direction?: "up" | "down" | "left" | "right" | undefined
    dist?: number,
    tvalue?: number,
    reflection?: Point,
    target?:any,
}

const Y_REFLECTION_VECTOR = new Point(1,-1)

export function check_collision_block(old_bounds: Bounds, block: Bounds, v: Point): CollisionResult {
    if (old_bounds.intersects(block)) {
        console.log("intersects with old bounds")
        console.log("already inside!", old_bounds, block)
        console.log("old left",old_bounds.left(), 'block right',block.right())
        return {
            collided: false
        }
    }
    let new_bounds = old_bounds.add(v)
    if (new_bounds.intersects(block)) {
        // console.log("intersects with new bounds")
        // console.log("velocity",v)
        // console.log('ball old',old_ball)
        // console.log("ball new",new_ball)
        // console.log("block",block)
        // console.log("new ball right",new_ball.right())

        if (old_bounds.right() <= block.left()) {
            let dist = block.left() - old_bounds.right()
            return {
                collided: true,
                direction: "right",
                dist: dist,
                tvalue: dist / v.x,
                reflection: new Point(-1, 1),
                target:block,
            }
        }
        if (old_bounds.left() >= block.right()) {
            let dist = block.right() - old_bounds.left()
            return {
                collided: true,
                direction: "left",
                dist: dist,
                tvalue: dist / v.x,
                reflection: new Point(-1, 1),
                target:block,
            }
        }
        if (old_bounds.top() >= block.bottom()) {
            let dist = block.bottom() - old_bounds.top()
            return {
                collided: true,
                direction: "up",
                dist,
                tvalue: dist / v.y,
                reflection: Y_REFLECTION_VECTOR,
                target:block,
            }
        }
        if (old_bounds.bottom() <= block.top()) {
            let dist = block.top() - old_bounds.bottom()
            return {
                collided: true,
                direction: "down",
                dist,
                tvalue: dist / v.y,
                reflection: Y_REFLECTION_VECTOR,
                target:block,
            }
        }
    }
    return {
        collided: false
    }
}
