import { Grid, GridSaveData } from "./Grid";
import { Camera, CameraSaveData } from "./Camera";
import { Vector2 } from "../../Boilerplate/Classes/Vector2";
import { GameBase } from "../../Boilerplate/Classes/GameBase";
import { Points } from "./Points";
import { Shop } from "./Shop";
import { UpgradeManager } from "./UpgradeManager";
import { Tooltip } from "./Tooltip";
import { Upgrades } from "../Enums/Upgrades";

export interface GameSaveData {
    grid: GridSaveData;
    camera: CameraSaveData;
    points: number;
    unlockedUpgrades: Upgrades[];
}

const SAVE_KEY = 'sweeperIdleSave';

export class Game extends GameBase {
    grid: Grid;
    camera: Camera;
    points: Points;
    shop: Shop;
    upgradeManager: UpgradeManager;
    tooltip: Tooltip;

    initialize() {
        const saveData = this.loadGameFromStorage();
        
        if (saveData) {
            this.grid = new Grid(64, 64, saveData.grid);
            this.camera = new Camera(saveData.camera);
            this.points = new Points();
            this.points.setPoints(saveData.points);
            this.shop = new Shop();
            this.upgradeManager = new UpgradeManager();
            this.upgradeManager.initialize();
            this.upgradeManager.setUnlockedUpgrades(saveData.unlockedUpgrades);
            this.tooltip = new Tooltip();
        } else {
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
        }
    }

    update() {
        this.tooltip.update();
        this.camera.update(this.input);
        this.shop.update(this.input, this.upgradeManager, this.points, this.tooltip);
        this.points.update(this.context, this.input);
        this.grid.update(this.camera, this.input, this.points, this.upgradeManager);
    }

    draw() {
        this.grid.draw(this.context, this.camera);
        this.points.draw(this.context);
        this.shop.draw(this.context, this.upgradeManager, this.points, this.input);
        this.tooltip.draw(this.context, this.points);
    }

    saveGame(): void {
        const saveData: GameSaveData = {
            grid: this.grid.getSaveData(),
            camera: this.camera.getSaveData(),
            points: this.points.getPoints(),
            unlockedUpgrades: this.upgradeManager.getUnlockedUpgrades()
        };
        
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('游戏已保存');
        } catch (e) {
            console.error('保存游戏失败:', e);
        }
    }

    loadGame(): boolean {
        const saveData = this.loadGameFromStorage();
        if (!saveData) {
            console.log('没有找到存档');
            return false;
        }

        this.grid = new Grid(64, 64, saveData.grid);
        this.camera = new Camera(saveData.camera);
        this.points = new Points();
        this.points.setPoints(saveData.points);
        this.upgradeManager.setUnlockedUpgrades(saveData.unlockedUpgrades);
        
        console.log('游戏已加载');
        return true;
    }

    hasSaveData(): boolean {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    clearSaveData(): void {
        localStorage.removeItem(SAVE_KEY);
        console.log('存档已清除');
    }

    private loadGameFromStorage(): GameSaveData | null {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (saved) {
                return JSON.parse(saved) as GameSaveData;
            }
        } catch (e) {
            console.error('加载存档失败:', e);
        }
        return null;
    }
}
