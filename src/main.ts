import * as PIXI from 'pixi.js';

class SlotGame {
  private app: PIXI.Application;
  private reelContainer: PIXI.Container;
  private reelWidth: number;
  private reelHeight: number;
  private imageWidth: number;
  private imageHeight: number;
  private minSpinSpeed: number; // 릴 최소 속도
  private maxSpinSpeed: number; // 릴 최대 속도
  private spinSpeed: number[]; // 릴 속도
  private spinDamping: number; // 릴이 멈추는 속도
  private spinDelay: number; //각 릴이 멈추는 지연시간
  private symbols: string[];
  private payouts: number[];
  private probabilities: number[];
  private isSpin: boolean;

  constructor() {
    this.app = new PIXI.Application({
      width: 600,
      height: 400,
      backgroundColor: 0x1099bb,
      view: document.getElementById('slot-machine') as HTMLCanvasElement,
    });

    this.reelContainer = new PIXI.Container();
    this.app.stage.addChild(this.reelContainer);

    this.init();
    this.createReels();
    this.setupInteraction();
  }

  private init(): void {
    this.reelWidth = 200;
    this.reelHeight = 400;
    this.imageWidth = 100;
    this.imageHeight = 100;
    this.minSpinSpeed = 5;
    this.maxSpinSpeed = 25;
    this.spinDamping = 0.5;
    this.spinDelay = 3;
    this.isSpin = false;

    // RTP 90.25%
    this.symbols = ['cherries', 'bell', 'bar', 'diamond', 'seven'];
    this.payouts = [5, 10, 20, 30, 77]; // 배수
    this.probabilities = [6 / 20, 5 / 20, 4 / 20, 3 / 20, 2 / 20]; // 확률
  }

  private createReels(): void {
    for (let i = 0; i < 3; i++) {
      const reel = new PIXI.Container();
      reel.x = i * this.reelWidth + this.imageWidth * 0.5;
      this.reelContainer.addChild(reel);
      const symbols = [...this.symbols];

      for (let i = symbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = symbols[i];
        symbols[i] = symbols[j];
        symbols[j] = temp;
      }

      for (let j = 0; j < symbols.length; j++) {
        const symbol = new PIXI.Sprite(PIXI.Texture.from(`src/images/${symbols[j]}.png`));
        symbol.name = symbols[j];
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

  private async spinReels(): Promise<void> {
    if (this.isSpin) return;
    this.isSpin = true;
    this.spinSpeed = [this.minSpinSpeed, this.minSpinSpeed, this.minSpinSpeed];

    const spinReel = (reel: PIXI.Container, index: number) => {
      const spinInterval = setInterval(() => {
        const firstSymbol = reel.children[0] as PIXI.Sprite;
        firstSymbol.y += this.spinSpeed[index];
        if (firstSymbol.y > this.reelHeight + this.imageHeight * 0.5) firstSymbol.y = -this.imageHeight * 0.5;

        for (let j = 1; j < reel.children.length; j++) {
          const symbol = reel.children[j] as PIXI.Sprite;
          symbol.y = firstSymbol.y + j * this.imageHeight;
          if (symbol.y > this.reelHeight + this.imageHeight * 0.5) symbol.y -= this.reelHeight + this.imageHeight;
        }

        this.spinSpeed[index] = Math.min(this.spinSpeed[index] + this.spinDamping, this.maxSpinSpeed);
      }, 16);

      return spinInterval;
    };

    // 스핀 시작
    const intervals = this.reelContainer.children.map((reel, index) => spinReel(reel as PIXI.Container, index));

    // 순차적으로 멈춤
    for (let i = 0; i < this.reelContainer.children.length; i++) {
      const reel = this.reelContainer.children[i] as PIXI.Container;
      const target = reel.children.find((element) => {
        return element.name === 'bar'; // 타겟으로 설정할 조건을 콜백 함수에 작성
      }) as PIXI.Sprite;

      //타겟 심볼 순서를 0으로 위치 변경
      const index = reel.children.indexOf(target);
      const front = reel.children.slice(0, index); // 기준 원소 앞의 부분
      const middle = reel.children.slice(index, index + 1); // 기준 원소
      const end = reel.children.slice(index + 1); // 기준 원소 뒤의 부분
      reel.children = [...middle, ...front, ...end]; // 기준 원소를 0번째로 이동시킨 배열 반환

      await this.stopReel(reel, intervals[i], i, target);
    }

    this.isSpin = false;
  }

  private stopReel(reel: PIXI.Container, interval: NodeJS.Timeout, index: number, target: PIXI.Sprite): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(interval);
        const stopInterval = setInterval(() => {
          let allStopped = true;

          if (target.y === this.reelHeight / 2 - this.imageHeight / 2 && this.spinSpeed[index] === this.minSpinSpeed) {
            clearInterval(stopInterval);
            resolve();
          } else {
            target.y += this.spinSpeed[index];
            if (target.y > this.reelHeight + this.imageHeight * 0.5) target.y = -this.imageHeight * 0.5;
            allStopped = false;
          }

          for (let j = 0; j < reel.children.length; j++) {
            const symbol = reel.children[j] as PIXI.Sprite;
            if (target === symbol) continue;
            symbol.y = target.y + j * this.imageHeight;
            if (symbol.y >= this.reelHeight) symbol.y -= this.reelHeight + this.imageHeight;
            allStopped = false;
          }

          this.spinSpeed[index] = Math.max(this.spinSpeed[index] - this.spinDamping, this.minSpinSpeed);

          if (allStopped) clearInterval(stopInterval);
        }, 16);
      }, this.spinDelay * 1000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SlotGame();
});
