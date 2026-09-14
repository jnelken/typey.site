import { ref } from 'vue';

let boltIdCounter = 0;

// How long the letter survives after the bolt is fired. Long enough to see the
// letter arrive and be hit — the joke only lands if the child watches it go.
export const STRIKE_MS = 260;
// How long the bolt itself stays on screen, fading after the strike.
export const BOLT_MS = 520;

// The bolts thrown by an overcharged battery. Each one is fired at the letter
// just typed; `onStrike` deletes it a beat later, and BatteryAnimation draws
// the bolt on the canvas it already owns.
export function useZaps({ onStrike } = {}) {
  const bolts = ref([]);
  // Pending timers, each remembering whether it is the one that eats a letter.
  const pending = new Set();

  const later = (fn, ms, eatsLetter = false) => {
    const entry = { eatsLetter, run: fn };
    entry.timer = setTimeout(() => {
      pending.delete(entry);
      fn();
    }, ms);
    pending.add(entry);
  };

  const strike = () => {
    const bolt = { id: ++boltIdCounter, firedAt: Date.now() };
    bolts.value = [...bolts.value, bolt];

    later(
      () => {
        if (typeof onStrike === 'function') onStrike();
      },
      STRIKE_MS,
      true
    );
    later(() => {
      bolts.value = bolts.value.filter(active => active.id !== bolt.id);
    }, BOLT_MS);

    return bolt;
  };

  // Escape wipes the battery and the bolts in the air — but a bolt in the air
  // has already been paid for at the keystroke that fired it, so it still eats
  // its letter on the way out. Cancelling the bite instead would charge the
  // child 1000% and hand the letter back, the one place in this feature where
  // the accounting would visibly not add up.
  const clear = () => {
    pending.forEach(entry => {
      clearTimeout(entry.timer);
      if (entry.eatsLetter) entry.run();
    });
    pending.clear();
    bolts.value = [];
  };

  return {
    bolts,
    strike,
    clear,
  };
}
