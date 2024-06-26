import * as PIXI from 'pixi.js'

class SlotGame {
    private app: PIXI.Application;
    private reelContainer: PIXI.Container;
    private reelWidth: number;
    private reelHeight: number;
    private imageWidth:number;
    private imageHeight:number;
    private spinSpeed:number;
    private symbols: string[];
    private payouts: number[];
    private probabilities: number[];
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
        this.imageWidth = 100;
        this.imageHeight = 100;
        this.spinSpeed = 5;

        this.symbols = ['cherries', 'bell', 'bar', 'diamond', 'seven'];
        this.payouts = [5, 10, 20, 30, 77]; // 배수
        this.probabilities = [6/20, 5/20, 4/20, 3/20, 2/20];// 확률
        this.textures = this.symbols.map(symbol => PIXI.Texture.from(`src/images/${symbol}.png`));

        this.createReels();
        this.setupInteraction();
    }

    private createReels(): void {
        for (let i = 0; i < 3; i++) {
            const reel = new PIXI.Container();
            reel.x = i * this.reelWidth + this.imageWidth * 0.5;
            this.reelContainer.addChild(reel);

            for (let j = 0; j < this.symbols.length; j++) {
                const symbolIndex = Math.floor(Math.random() * this.textures.length);
                const symbol = new PIXI.Sprite(this.textures[symbolIndex]);
                symbol.y = j * this.imageHeight;
                symbol.width = this.imageWidth;
                symbol.height = this.imageHeight;
                reel.addChild(symbol);
            }
        }
    }

    private setupInteraction(): void {
        const spinButton = document.getElementById('spin-button') as HTMLButtonElement;
        spinButton.addEventListener('click', () => this.spinReels());
    }

    private spinReels(): void {
        for (let i = 0; i < this.reelContainer.children.length; i++) {
            const reel = this.reelContainer.children[i] as PIXI.Container;

            for (let j = 0; j < reel.children.length; j++) {
                const symbol = reel.children[j] as PIXI.Sprite;
                PIXI.ticker.shared.add(() => {
                    if (symbol.y < this.reelHeight) {
                        symbol.y += this.spinSpeed;
                    } else {
                        symbol.y = -this.imageHeight;
                    }
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SlotGame();
});
