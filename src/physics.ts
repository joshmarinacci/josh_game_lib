import {Bounds, Point} from "./math.js";

type CollisionResult = {
    collided: boolean
    direction?: "up" | "down" | "left" | "right" | undefined
    dist?: number,
    tvalue?: number,
    reflection?: Point,

}

export function check_collision_block(old_ball: Bounds, block: Bounds, v: Point): CollisionResult {
    if (old_ball.intersects(block)) {
        // console.log("already inside!")
        return {
            collided: false
        }
    }
    let new_ball = old_ball.add(v)
    if (new_ball.intersects(block)) {
        // console.log("intersects")
        // console.log("velocity",v)
        // console.log('ball old',old_ball)
        // console.log("ball new",new_ball)
        // console.log("block",block)
        // console.log("new ball right",new_ball.right())

        if (old_ball.right() < block.left()) {
            let dist = block.left() - old_ball.right()
            return {
                collided: true,
                direction: "right",
                dist: dist,
                tvalue: dist / v.x,
                reflection: new Point(-1, 1)
            }
        }
        if (old_ball.left() > block.right()) {
            let dist = block.right() - old_ball.left()
            return {
                collided: true,
                direction: "left",
                dist: dist,
                tvalue: dist / v.x,
                reflection: new Point(-1, 1)
            }
        }
        if (old_ball.top() > block.bottom()) {
            let dist = block.bottom() - old_ball.top()
            return {
                collided: true,
                direction: "up",
                dist,
                tvalue: dist / v.y,
                reflection: new Point(1, -1)
            }
        }
        if (old_ball.bottom() < block.top()) {
            let dist = block.top() - old_ball.bottom()
            return {
                collided: true,
                direction: "down",
                dist,
                tvalue: dist / v.y,
                reflection: new Point(1, -1)
            }
        }
    }
    return {
        collided: false
    }
}
