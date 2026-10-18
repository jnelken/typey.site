import { ref } from 'vue';

let boltIdCounter = 0;

// How long the letter survives after the bolt is fired. Long enough to see the
// letter arrive and be hit — the joke only lands if the child watches it go.
export const STRIKE_MS = 260;
// How long the bolt itself stays on screen, fading after the strike.
export const BOLT_MS = 520;
// Chance a bolt actually eats the letter it was aimed at. Most attempts miss —
// the charge is still spent either way, but a miss never shows a bolt.
export const HIT_CHANCE = 1 / 5;

// The bolts thrown by an overcharged battery. Each attempt rolls first; only a
// hit puts a bolt on screen and calls `onStrike` a beat later to delete the
// letter. BatteryAnimation draws bolts on the canvas it already owns.
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

  // Roll before anything is drawn so a miss produces no bolt, no deletion
  // timer, and an explicit unsuccessful result the caller can use to skip
  // bolt-associated audio.
  const strike = () => {
    const hits = Math.random() < HIT_CHANCE;
    if (!hits) {
      return { hit: false, bolt: null };
    }

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

    return { hit: true, bolt };
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
