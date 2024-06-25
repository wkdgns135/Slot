import * as PIXI from 'pixi.js'

class SlotGame {
    private app: PIXI.Application;
    private reelContainer: PIXI.Container;
    private reelWidth: number;
    private reelHeight: number;
    private symbols: string[];
    private textures: PIXI.Texture[];

    constructor() {
        this.app = new PIXI.Application({
            width: 600,
            height: 400,
            backgroundColor: 0x1099bb,
            view: document.getElementById('slot-machine') as HTMLCanvasElement
        });

        this.reelContainer = new PIXI.Container();
        this.app.stage.addChild(this.reelContainer);

        this.reelWidth = 200;
        this.reelHeight = 400;
        this.symbols = ['cherry', 'bell', 'lemon', 'orange', 'star', 'diamond'];
        this.textures = this.symbols.map(symbol => PIXI.Texture.from(`src/images/${symbol}.png`));

        this.createReels();
        this.setupInteraction();
    }

    private createReels(): void {
        for (let i = 0; i < 3; i++) {
            const reel = new PIXI.Container();
            reel.x = i * this.reelWidth;
            this.reelContainer.addChild(reel);

            for (let j = 0; j < 5; j++) {
                const symbolIndex = Math.floor(Math.random() * this.textures.length);
                const symbol = new PIXI.Sprite(this.textures[symbolIndex]);
                symbol.y = j * 80;
                symbol.scale.set(0.5, 0.5);
                reel.addChild(symbol);
            }
        }
    }

    private setupInteraction(): void {
        const spinButton = document.getElementById('spin-button') as HTMLButtonElement;
        spinButton.addEventListener('click', () => this.spinReels());
    }

    private spinReels(): void {
        const tweenDuration = 1000;

        for (let i = 0; i < this.reelContainer.children.length; i++) {
            const reel = this.reelContainer.children[i] as PIXI.Container;

            for (let j = 0; j < reel.children.length; j++) {
                const symbol = reel.children[j] as PIXI.Sprite;

                // Simple animation to move symbols down
                const targetY = symbol.y + this.reelHeight;
                PIXI.Ticker.shared.add(() => {
                    if (symbol.y < targetY) {
                        symbol.y += 10;
                    } else {
                        symbol.y = 0;
                    }
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SlotGame();
});
