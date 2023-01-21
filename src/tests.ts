import {Bounds} from "./math.js";

const rect1 = new Bounds(0,0, 50,50)
const rect2 = new Bounds(20,20,50,50)
console.assert(rect1.intersects(rect2),"should be true")


const rect3 = new Bounds(55,55,50,50)
console.assert(!rect1.intersects(rect3),'should be false')
