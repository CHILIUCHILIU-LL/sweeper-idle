import "./Boilerplate/Classes/Context2D";

import { Game } from "./Game/Classes/Game";

const game = new Game();

declare global {
    interface Window {
        sweeperGame: Game;
    }
}

window.sweeperGame = game;

game.run();
