import { describe, it, expect } from '@jest/globals';
import { createTidbytDevPlugin, promptSvg } from '../../server/tidbytDevPlugin';

describe('Tidbyt dev plugin', () => {
  it('renders submitted text into a 64x32 SVG', () => {
    const svg = promptSvg('hello tidbyt');

    expect(svg).toContain('width="64" height="32"');
    expect(svg).toContain('hello');
    expect(svg).toContain('tidbyt');
  });

  it('escapes markup instead of inserting it into the SVG', () => {
    const svg = promptSvg('<script>alert("no")</script>');

    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
    expect(svg).toContain('&quot;no&quot;');
  });

  it('wraps and truncates long prompts to fit the display', () => {
    const svg = promptSvg('one two three four five six seven eight nine ten eleven twelve thirteen');
    const lineCount = (svg.match(/<tspan/g) || []).length;

    expect(lineCount).toBeGreaterThan(1);
    expect(lineCount).toBeLessThanOrEqual(4);
  });

  it('creates a serve-only Vite plugin', () => {
    const plugin = createTidbytDevPlugin();

    expect(plugin.name).toBe('typey-tidbyt-dev');
    expect(plugin.apply).toBe('serve');
  });
});
