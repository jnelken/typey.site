import { describe, it, expect } from '@jest/globals';
import { useColorMode } from '@/features/easter-eggs/composables/useColorMode';

describe('useColorMode', () => {
  it('starts off', () => {
    expect(useColorMode().isActive.value).toBe(false);
  });

  it('toggles on and back off', () => {
    const color = useColorMode();

    color.toggle();
    expect(color.isActive.value).toBe(true);

    color.toggle();
    expect(color.isActive.value).toBe(false);
  });

  it('start and stop are idempotent', () => {
    const color = useColorMode();

    color.start();
    color.start();
    expect(color.isActive.value).toBe(true);

    color.stop();
    color.stop();
    expect(color.isActive.value).toBe(false);
  });

  it('gives each caller its own state', () => {
    const first = useColorMode();
    const second = useColorMode();

    first.start();
    expect(second.isActive.value).toBe(false);
  });
});
