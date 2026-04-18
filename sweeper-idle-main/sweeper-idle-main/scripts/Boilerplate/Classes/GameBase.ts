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

    isPaused: boolean = false;
    private updateTimer: number = null;
    private drawTimer: number = null;

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

    private baseUpdate() {
        this.input.update();
        if (!this.isPaused) {
            this.update();
        }
    }

    private baseDraw() {
        this.context.clearRect(0, 0, this.windowWidth, this.windowHeight);
        this.draw();
    }

    private startUpdating() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.updateTimer = window.setInterval(() => this.baseUpdate(), GameBase.updateInterval);
    }

    private startDrawing() {
        if (this.drawTimer) {
            clearInterval(this.drawTimer);
        }
        this.drawTimer = window.setInterval(() => this.baseDraw(), GameBase.drawInterval);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    private updateWindowSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
    }
}
