import { Context2D } from "./Context2D";
import { Input } from "./Input";

export abstract class GameBase {
    static updatesPerSecond = 60;
    static drawsPerSecond = 60;
    static updateInterval = 1000 / 60;
    static drawInterval = 1000 / 60;
    static updateTime = 1 / 60;
    static drawTime = 1 / 60;

    canvas: HTMLCanvasElement;
    context: Context2D;

    input: Input;

    windowWidth: number;
    windowHeight: number;

    private isPaused: boolean = false;
    private updateIntervalId: number = 0;
    private drawIntervalId: number = 0;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

        this.context = this.canvas.getContext2D();

        this.input = new Input(this.canvas);

        this.updateWindowSize();
        window.addEventListener('resize', () => this.updateWindowSize());
    }

    run() {
        this.initialize();
        this.startUpdating();
        this.startDrawing();
    }

    abstract initialize();

    abstract update();

    abstract draw();

    getPaused(): boolean {
        return this.isPaused;
    }

    togglePause(): boolean {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    setPaused(paused: boolean): void {
        this.isPaused = paused;
    }

    private baseUpdate() {
        if (!this.isPaused) {
            this.input.update();
            this.update();
        }
    }

    private baseDraw() {
        this.context.clearRect(0, 0, this.windowWidth, this.windowHeight);
        this.draw();
    }

    private startUpdating() {
        this.updateIntervalId = window.setInterval(() => this.baseUpdate(), GameBase.updateInterval);
    }

    private startDrawing() {
        this.drawIntervalId = window.setInterval(() => this.baseDraw(), GameBase.drawInterval);
    }

    private updateWindowSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
    }
}
