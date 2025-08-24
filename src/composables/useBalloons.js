import { ref } from 'vue';

const MAX_BALLOONS = 100;
const SPAWN_DELAY = 100; // ms between balloon spawns
const POP_BASE_DELAY = 5000; // base time before balloon pops
const POP_RANDOM_VARIATION = 2000; // random variation (0-2000ms added)

let balloonIdCounter = 0;

export function useBalloons() {
  const balloons = ref([]);

  const colors = [
    '#ff6b6b', // primary red
    '#4ecdc4', // secondary teal
    '#feca57', // tertiary yellow
    '#48e5a3', // success green
    '#ff9ff3', // pink
    '#54a0ff', // blue
    '#5f27cd', // purple
    '#00d2d3', // cyan
    '#ff9f43', // orange
    '#10ac84', // emerald
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomPosition = () => {
    // Random horizontal position with some margin from edges
    return Math.random() * 80 + 10; // 10% to 90% of screen width
  };

  const createBalloon = () => {
    return {
      id: `balloon-${++balloonIdCounter}`,
      color: getRandomColor(),
      left: getRandomPosition(),
      isPopping: false,
    };
  };

  const removeBalloon = balloonId => {
    const index = balloons.value.findIndex(b => b.id === balloonId);
    if (index !== -1) {
      balloons.value.splice(index, 1);
    }
  };

  const popBalloon = balloonId => {
    const balloon = balloons.value.find(b => b.id === balloonId);
    if (balloon && !balloon.isPopping) {
      balloon.isPopping = true;

      // Remove after pop animation completes
      setTimeout(() => {
        removeBalloon(balloonId);
      }, 500); // matches pop animation duration
    }
  };

  const spawnBalloons = async count => {
    if (count <= 0 || count > 100) return;

    // Limit total balloons on screen
    const balloonsToSpawn = Math.min(
      count,
      MAX_BALLOONS - balloons.value.length,
    );

    for (let i = 0; i < balloonsToSpawn; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, SPAWN_DELAY));
      }

      const balloon = createBalloon();
      balloons.value.push(balloon);

      // Schedule balloon to pop after delay + random variation
      const popDelay = POP_BASE_DELAY + Math.random() * POP_RANDOM_VARIATION;
      setTimeout(() => {
        popBalloon(balloon.id);
      }, popDelay);
    }
  };

  const clearAllBalloons = () => {
    balloons.value = [];
  };

  return {
    balloons,
    spawnBalloons,
    popBalloon,
    clearAllBalloons,
  };
}
