export class KeyboardSystem {
    private keystate: Map<string, boolean>;
    private element: any;
    constructor(element) {
        this.keystate = new Map<string,boolean>
        this.element = element
        this.element.addEventListener('keydown',(e) => {
            this.keystate.set(e.code,true)
        })
        this.element.addEventListener('keyup',(e) => {
            this.keystate.set(e.code,false)
        })
    }
    isPressed(keyname:string):boolean {
        return this.keystate.has(keyname) && (this.keystate.get(keyname) === true)
    }
}
