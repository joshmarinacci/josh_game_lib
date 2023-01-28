export type TimeInfo = {
    sinceStart:number,
    delta:number,
}
export interface TickClient {
    tick(time:TimeInfo):void
}

export interface GameRunner {
    start(p: TickClient): void;
    stop(): void;
}

export class RequestAnimGameRunner implements GameRunner {
    private running: boolean;
    private last: number;
    private scale: number;

    constructor(scale:number) {
        this.running = false
        this.last = 0
        this.scale = scale
    }

    start(p: TickClient): void {
        this.running = true
        let self = this

        function going(ts:number) {
            ts = ts/1000
            let time:TimeInfo=  {
                sinceStart:ts/self.scale,
                delta:(ts-self.last)/self.scale
            }
            self.last = ts
             p.tick(time)
            if (self.running) requestAnimationFrame(going)
        }

        requestAnimationFrame(going)
    }

    stop() {
        this.running = false
    }
}

export class SetIntervalTicker implements GameRunner {
    private running: boolean;
    private delay: number;
    private handle: number;
    private time: number;

    constructor(delay: number) {
        this.running = false
        this.delay = delay
        this.time = 0
    }

    start(p: TickClient) {
        this.handle = setInterval(() => {
            this.time += this.delay
            p.tick({delta:this.delay, sinceStart:this.time})
        }, this.delay)
    }

    stop() {
        clearInterval(this.handle)
    }
}

export type Seconds = number
export type TValue = number

