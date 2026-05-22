import { Context2D } from "../../Boilerplate/Classes/Context2D";
import { Input } from "../../Boilerplate/Classes/Input";
import { Align } from "../../Boilerplate/Enums/Align";
import { Fonts } from "../../Boilerplate/Enums/Fonts";
import { MouseButton } from "../../Boilerplate/Enums/MouseButton";
import { pointWithinRectangle } from "../../Boilerplate/Functions";
import { AudioManager } from "./AudioManager";
import { Colours } from "./Colours";

export class MusicButton {
    private width = 60;
    private height = 60;

    update(input: Input, audioManager: AudioManager, canvasWidth: number) {
        const x = canvasWidth - this.width - 20;
        const y = 20;

        if (pointWithinRectangle(input.getX(), input.getY(), x, y, this.width, this.height)) {
            if (input.isReleased(MouseButton.Left) && !input.getLeftUsed()) {
                input.setLeftUsed();
                audioManager.toggle();
            }
        }
    }

    draw(context: Context2D, audioManager: AudioManager, canvasWidth: number) {
        const x = canvasWidth - this.width - 20;
        const y = 20;

        context.drawBorderedRectangle(x, y, this.width, this.height, Colours.boxUncovered, Colours.boxBorder);

        const label = audioManager.isPlaying() ? '||' : '♫';
        context.drawString(label, x + this.width / 2, y + this.height / 2 + 4, 28, Fonts.Arial, Colours.green, Align.Center);
    }
}
