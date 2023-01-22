export interface TickClient {
    tick():void
}

export interface GameRunner {
    start(p: TickClient): void;

    stop(): void;
}

export class RequestAnimGameRunner implements GameRunner {
    private running: boolean;

    constructor() {
        this.running = false
    }

    start(p: TickClient): void {
        this.running = true
        let self = this

        function going() {
            p.tick()
            if (self.running) requestAnimationFrame(going)
        }

        going()
    }

    stop() {
        this.running = false
    }
}

export class SetIntervalTicker implements GameRunner {
    private running: boolean;
    private delay: number;
    private handle: number;

    constructor(delay: number) {
        this.running = false
        this.delay = delay
    }

    start(p: TickClient) {
        this.handle = setInterval(() => {
            p.tick()
        }, this.delay)
    }

    stop() {
        clearInterval(this.handle)
    }
}
