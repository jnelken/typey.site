import { ref } from 'vue';

let boltIdCounter = 0;

// How long the letter survives after the bolt is fired. Long enough to see the
// letter arrive and be hit — the joke only lands if the child watches it go.
export const STRIKE_MS = 260;
// How long the bolt itself stays on screen, fading after the strike.
export const BOLT_MS = 520;
// Chance a bolt actually eats the letter it was aimed at. Most bolts miss —
// the charge is still spent either way, but the letter usually survives.
export const HIT_CHANCE = 1 / 5;

// The bolts thrown by an overcharged battery. Each one is fired at the letter
// just typed; a hit calls `onStrike` a beat later to delete it, and
// BatteryAnimation draws the bolt on the canvas it already owns.
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

    // Roll once at fire time so Escape/clear knows whether this bolt owed a
    // letter — a miss never deletes, even if the bolt is wiped mid-flight.
    const hits = Math.random() < HIT_CHANCE;
    if (hits) {
      later(
        () => {
          if (typeof onStrike === 'function') onStrike();
        },
        STRIKE_MS,
        true
      );
    }
    later(() => {
      bolts.value = bolts.value.filter(active => active.id !== bolt.id);
    }, BOLT_MS);

    return bolt;
  };

  // Escape wipes the battery and the bolts in the air — but a bolt that already
  // rolled a hit has claimed its letter, so it still eats on the way out.
  // Cancelling a hit instead would spend the charge and hand the letter back.
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
