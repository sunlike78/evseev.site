// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createInfector, getInfectableElements } from '../src/meta/DOMInfector.js';

describe('DOMInfector', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="ad-slot">Ad</div>
      <button>Click</button>
      <div id="ui-panel">Panel</div>
    `;
  });

  it('getInfectableElements finds elements', () => {
    const elements = getInfectableElements();
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('createInfector infects elements in order', () => {
    const infector = createInfector();
    const infected = infector.infectNext();
    expect(infected).not.toBe(null);
    expect(infected.classList.contains('infected')).toBe(true);
  });
});
