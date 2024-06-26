export class Util {
  public static createSprite(name: string, size: number[], pos: number[], container: PIXI.Container): PIXI.Sprite {
    const sprite = new PIXI.Sprite(PIXI.Texture.from(`src/images/${name}.png`));
    sprite.width = size[0];
    sprite.height = size[1];
    sprite.x = pos[0];
    sprite.y = pos[1];

    container.addChild(sprite);
    return sprite;
  }

  public static weightedRandom<T>(items: T[], weights: number[]): T {
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
