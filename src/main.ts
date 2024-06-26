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
  private targets: string[];
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
    this.maxSpinSpeed = 30;
    this.spinDamping = 0.5;
    this.spinDelay = 3;
    this.isSpin = false;
    this.targets = [];

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

      const centerIndex = Math.floor(symbols.length / 2); // 배열의 중앙 인덱스
      for (let j = 0; j < symbols.length; j++) {
        const symbol = new PIXI.Sprite(PIXI.Texture.from(`src/images/${symbols[j]}.png`));
        symbol.name = symbols[j];
        symbol.width = this.imageWidth;
        symbol.height = this.imageHeight * 0.9;
        const centerY = this.reelHeight / 2 - this.imageHeight / 2;

        // 중앙에 위치할 심볼
        if (j === centerIndex) {
          symbol.y = centerY; // 중앙에 위치
        }
        // 중앙을 기준으로 위에 위치할 심볼들
        else if (j < centerIndex) {
          symbol.y = centerY + (j - centerIndex) * this.imageHeight; // 중앙보다 위쪽으로 배치
        }
        // 중앙을 기준으로 아래에 위치할 심볼들
        else {
          symbol.y = centerY + (j - centerIndex) * this.imageHeight; // 중앙보다 아래쪽으로 배치
        }

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
      const targetName = this.weightedRandom(this.symbols, this.probabilities);
      this.targets.push(targetName);
      const target = reel.children.find((element) => {
        return element.name === targetName; // 타겟으로 설정할 조건을 콜백 함수에 작성
      }) as PIXI.Sprite;
      await this.stopReel(reel, intervals[i], i, target);
    }

    this.checkReward();
    this.isSpin = false;
  }

  private stopReel(reel: PIXI.Container, interval: NodeJS.Timeout, index: number, target: PIXI.Sprite): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(interval);
        //타겟 심볼 순서를 0으로 위치 변경
        const targetIndex = reel.children.indexOf(target);
        const front = reel.children.slice(0, targetIndex); // 기준 원소 앞의 부분
        const middle = reel.children.slice(targetIndex, targetIndex + 1); // 기준 원소
        const end = reel.children.slice(targetIndex + 1); // 기준 원소 뒤의 부분
        reel.children = [...middle, ...front, ...end]; // 기준 원소를 0번째로 이동시킨 배열 반환

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

  private checkReward() {
    console.log(this.targets);
  }

  private weightedRandom<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('아이템과 가중치 배열의 길이가 같아야 합니다.');
    }

    // PRNG (의사난수 생성기) 함수
    function PRNG(seed: number): () => number {
      let value = seed;
      return function () {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
      };
    }

    // 현재 시간을 나노초 단위로 시드로 초기화
    const seed = performance.now() * 1000000; // 밀리초를 나노초로 변환
    const random = PRNG(seed);

    // 총 가중치 계산
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    // 0과 총 가중치 사이의 랜덤 숫자 생성
    let randomValue = random() * totalWeight;

    // 아이템을 순회하면서 가중치를 랜덤 값에서 빼기
    for (let i = 0; i < items.length; i++) {
      randomValue -= weights[i];
      if (randomValue < 0) {
        return items[i];
      }
    }

    // 반올림 오류를 방지하기 위해 마지막 아이템 반환
    return items[items.length - 1];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SlotGame();
});
