import { Grid } from "./Grid";
import { Camera } from "./Camera";
import { Vector2 } from "../../Boilerplate/Classes/Vector2";
import { GameBase } from "../../Boilerplate/Classes/GameBase";
import { Points } from "./Points";
import { Shop } from "./Shop";
import { UpgradeManager } from "./UpgradeManager";
import { Tooltip } from "./Tooltip";
import { Colours } from "./Colours";
import { Align } from "../../Boilerplate/Enums/Align";
import { Fonts } from "../../Boilerplate/Enums/Fonts";
import { MouseButton } from "../../Boilerplate/Enums/MouseButton";
import { pointWithinRectangle } from "../../Boilerplate/Functions";

export class Game extends GameBase {
    grid: Grid;
    camera: Camera;
    points: Points;
    shop: Shop;
    upgradeManager: UpgradeManager;
    tooltip: Tooltip;

    private pauseButtonX: number;
    private pauseButtonY: number;
    private pauseButtonW: number = 100;
    private pauseButtonH: number = 40;

    private saveButtonX: number;
    private saveButtonY: number;
    private saveButtonW: number = 100;
    private saveButtonH: number = 40;

    private loadButtonX: number;
    private loadButtonY: number;
    private loadButtonW: number = 100;
    private loadButtonH: number = 40;

    private musicButtonX: number;
    private musicButtonY: number;
    private musicButtonW: number = 100;
    private musicButtonH: number = 40;

    private isMusicPlaying: boolean = false;
    private music: HTMLAudioElement = null;

    private readonly SAVE_KEY = 'sweeperIdleSave';

    initialize() {
        this.initMusic();

        this.grid = new Grid(64, 64);

        this.camera = new Camera();
        const gridCenter = new Vector2();
        gridCenter.x = 64 * ((64 / 2) + 1);
        gridCenter.y = 64 * ((64 / 2) + 1);
        this.camera.centerOnPosition(gridCenter, this.canvas);

        this.points = new Points();

        this.shop = new Shop();

        this.upgradeManager = new UpgradeManager();
        this.upgradeManager.initialize();

        this.tooltip = new Tooltip();

        this.updateButtonPositions();
    }

    private initMusic() {
        this.music = document.getElementById('bgMusic') as HTMLAudioElement;
        if (this.music) {
            this.music.loop = true;
            this.music.volume = 0.5;
        }
    }

    private updateButtonPositions() {
        const buttonSpacing = 10;
        const startX = this.windowWidth - (this.pauseButtonW + this.saveButtonW + this.loadButtonW + this.musicButtonW + buttonSpacing * 3) - 20;
        
        this.pauseButtonX = startX;
        this.pauseButtonY = 20;

        this.saveButtonX = this.pauseButtonX + this.pauseButtonW + buttonSpacing;
        this.saveButtonY = 20;

        this.loadButtonX = this.saveButtonX + this.saveButtonW + buttonSpacing;
        this.loadButtonY = 20;

        this.musicButtonX = this.loadButtonX + this.loadButtonW + buttonSpacing;
        this.musicButtonY = 20;
    }

    update() {
        this.updateButtonPositions();
        
        this.handleButtonClicks();

        this.tooltip.update();
        this.camera.update(this.input);
        this.shop.update(this.input, this.upgradeManager, this.points, this.tooltip);
        this.points.update(this.context, this.input);
        this.grid.update(this.camera, this.input, this.points, this.upgradeManager);
    }

    private handleButtonClicks() {
        if (this.input.isReleased(MouseButton.Left) && !this.input.getLeftUsed()) {
            const mouseX = this.input.getX();
            const mouseY = this.input.getY();

            if (pointWithinRectangle(mouseX, mouseY, this.pauseButtonX, this.pauseButtonY, this.pauseButtonW, this.pauseButtonH)) {
                this.input.setLeftUsed();
                this.togglePause();
            }
            else if (pointWithinRectangle(mouseX, mouseY, this.saveButtonX, this.saveButtonY, this.saveButtonW, this.saveButtonH)) {
                this.input.setLeftUsed();
                this.saveGame();
            }
            else if (pointWithinRectangle(mouseX, mouseY, this.loadButtonX, this.loadButtonY, this.loadButtonW, this.loadButtonH)) {
                this.input.setLeftUsed();
                this.loadGame();
            }
            else if (pointWithinRectangle(mouseX, mouseY, this.musicButtonX, this.musicButtonY, this.musicButtonW, this.musicButtonH)) {
                this.input.setLeftUsed();
                this.toggleMusic();
            }
        }
    }

    draw() {
        this.grid.draw(this.context, this.camera);
        this.points.draw(this.context);
        this.shop.draw(this.context, this.upgradeManager, this.points, this.input);
        this.tooltip.draw(this.context, this.points);

        this.drawButtons();

        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }

    private drawButtons() {
        const pauseText = this.isPaused ? "继续" : "暂停";
        this.drawButton(this.pauseButtonX, this.pauseButtonY, this.pauseButtonW, this.pauseButtonH, pauseText);

        this.drawButton(this.saveButtonX, this.saveButtonY, this.saveButtonW, this.saveButtonH, "存档");

        this.drawButton(this.loadButtonX, this.loadButtonY, this.loadButtonW, this.loadButtonH, "读档");

        const musicText = this.isMusicPlaying ? "音乐关" : "音乐开";
        this.drawButton(this.musicButtonX, this.musicButtonY, this.musicButtonW, this.musicButtonH, musicText);
    }

    private drawButton(x: number, y: number, w: number, h: number, text: string) {
        const mouseX = this.input.getX();
        const mouseY = this.input.getY();
        
        let colour = Colours.boxCovered;
        if (pointWithinRectangle(mouseX, mouseY, x, y, w, h)) {
            colour = Colours.boxUncovered;
        }

        this.context.drawBorderedRectangle(x, y, w, h, colour, Colours.boxBorder);
        this.context.drawString(text, x + w / 2, y + h / 2 + 4, 24, Fonts.Arial, Colours.boxBorder, Align.Center);
    }

    private drawPauseOverlay() {
        this.context.globalAlpha = 0.5;
        this.context.drawFillRectangle(0, 0, this.windowWidth, this.windowHeight, Colours.background);
        this.context.globalAlpha = 1.0;

        const pauseText = "游戏已暂停";
        const textSize = 64;
        const measurement = this.context.measureString(pauseText, textSize, Fonts.Arial, Align.Center);
        
        const centerX = this.windowWidth / 2;
        const centerY = this.windowHeight / 2;

        this.context.drawBorderedRectangle(centerX - measurement.width / 2 - 20, centerY - textSize / 2 - 10, measurement.width + 40, textSize + 20, Colours.boxUncovered, Colours.boxBorder);
        this.context.drawString(pauseText, centerX, centerY + 4, textSize, Fonts.Arial, Colours.yellow, Align.Center);
    }

    saveGame() {
        const saveData = {
            grid: this.grid.save(),
            points: this.points.save(),
            upgradeManager: this.upgradeManager.save(),
            savedAt: Date.now()
        };

        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('游戏已保存');
        } catch (e) {
            console.error('保存游戏失败:', e);
        }
    }

    loadGame() {
        try {
            const saveDataStr = localStorage.getItem(this.SAVE_KEY);
            if (!saveDataStr) {
                console.log('没有找到存档');
                return;
            }

            const saveData = JSON.parse(saveDataStr);
            
            if (saveData.grid) {
                this.grid.load(saveData.grid);
            }
            if (saveData.points) {
                this.points.load(saveData.points);
            }
            if (saveData.upgradeManager) {
                this.upgradeManager.load(saveData.upgradeManager);
            }

            console.log('游戏已读取');
        } catch (e) {
            console.error('读取游戏失败:', e);
        }
    }

    toggleMusic() {
        if (!this.music) {
            console.log('未找到音乐元素');
            return;
        }

        if (this.isMusicPlaying) {
            this.music.pause();
            this.isMusicPlaying = false;
        } else {
            this.music.play().catch(e => {
                console.log('播放音乐失败:', e);
            });
            this.isMusicPlaying = true;
        }
    }
}
