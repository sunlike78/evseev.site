// src/ui/ClickTexts.js
import { getLocale } from '../i18n/i18n.js';
import textsRu from '../data/texts-ru.js';
import textsEn from '../data/texts-en.js';
import textsDe from '../data/texts-de.js';

export const TEXT_POOLS = {
  ru: textsRu,
  en: textsEn,
  de: textsDe,
};

const TRIGGER_CHANCE = 0.08; // Rare emotional reward (~1 in 12-15 clicks)
const COOLDOWN = 3.5;       // 3.5s cooldown between emotional phrases
const MAX_ACTIVE = 1;       // Strictly 1 phrase at a time - ZERO overlapping!
const FRENZY_STREAK = 12;

const STAGE_POOLS = {
  1: ['bio', 'meta'],
  2: ['bio', 'meta'],
  3: ['bio', 'meta', 'existential', 'glitch'],
  4: ['bio', 'meta', 'existential', 'glitch', 'aggressive'],
  5: ['bio', 'meta', 'existential', 'glitch', 'aggressive', 'cosmic'],
};

export const CATEGORY_COLORS = {
  bio:          { h: 140, s: 95, l: 65, label: 'Био-мутация' },
  meta:         { h: 195, s: 95, l: 70, label: 'Мета-ирония' },
  existential:  { h: 275, s: 90, l: 75, label: 'Экзистенция' },
  glitch:       { h: 0,   s: 0,  l: 100, label: 'Глитч-код' },
  aggressive:   { h: 0,   s: 95, l: 65, label: 'Агрессия' },
  cosmic:       { h: 285, s: 100, l: 75, label: 'Космос' },
  frenzy:       { h: 48,  s: 100, l: 60, label: 'Френзи' },
  milestone:    { h: 42,  s: 100, l: 55, label: 'Веха' },
  golden:       { h: 45,  s: 100, l: 60, label: 'Золотая спора' },
  combo:        { h: 160, s: 90, l: 65, label: 'Комбо-стрик' },
};

export function createClickTexts(state = null) {
  let active = [];
  let cooldownTimer = 0;
  let recentIds = [];
  let isFirstClick = true;

  function getPool() {
    const locale = getLocale() || 'ru';
    return TEXT_POOLS[locale] || TEXT_POOLS.en || textsRu;
  }

  function recordToArchive(phraseId, text, category) {
    if (!state) return;
    if (!state.whisperArchive) state.whisperArchive = [];
    if (!state.whisperArchive.some((item) => item.id === phraseId)) {
      state.whisperArchive.push({
        id: phraseId,
        text,
        category,
        discoveredAt: Date.now(),
      });
    }
  }

  function pickText(category) {
    const pool = getPool();
    const texts = pool[category];
    if (!texts || texts.length === 0) return null;
    const available = texts.filter((_, i) => !recentIds.includes(category + ':' + i));
    const list = available.length > 0 ? available : texts;
    const idx = Math.floor(Math.random() * list.length);
    const text = list[idx];
    const globalIdx = texts.indexOf(text);
    const phraseId = category + ':' + globalIdx;
    recentIds.push(phraseId);
    if (recentIds.length > 35) recentIds.shift();

    recordToArchive(phraseId, text, category);
    return text;
  }

  function spawn(x, y, text, category) {
    // Strictly clear any previous text so there is NEVER any overlap
    active.length = 0;
    active.push({
      x,
      y: y - 35,
      text,
      category,
      life: 2.2,
      maxLife: 2.2,
      vy: -28,
      scale: 1.0,
      rotation: 0,
    });
  }

  return {
    onClick(x, y, context) {
      const { stage, streak, isGoldenSpore } = context;

      if (isFirstClick) {
        isFirstClick = false;
        const text = pickText('bio');
        if (text) {
          spawn(x, y, text, 'bio');
          cooldownTimer = COOLDOWN;
        }
        return;
      }

      if (isGoldenSpore) {
        const text = pickText('golden');
        if (text) {
          spawn(x, y, text, 'golden');
          cooldownTimer = 2.0;
        }
        return;
      }

      if (streak >= FRENZY_STREAK && cooldownTimer <= 0) {
        const text = pickText('frenzy');
        if (text) {
          spawn(x, y, text, 'frenzy');
          cooldownTimer = 4.0;
        }
        return;
      }

      if (cooldownTimer > 0) return;
      if (Math.random() > TRIGGER_CHANCE) return;

      const availablePools = STAGE_POOLS[Math.min(stage, 5)] || STAGE_POOLS[1];
      const category = availablePools[Math.floor(Math.random() * availablePools.length)];
      const text = pickText(category);
      if (text) {
        spawn(x, y, text, category);
        cooldownTimer = COOLDOWN;
      }
    },

    update(dt) {
      if (cooldownTimer > 0) cooldownTimer -= dt;
      for (let i = active.length - 1; i >= 0; i--) {
        const t = active[i];
        t.y += t.vy * dt;
        t.vy *= 0.96;
        t.life -= dt;
        const progress = 1 - t.life / t.maxLife;
        if (progress < 0.15) {
          t.scale = 0.85 + (progress / 0.15) * 0.25;
        } else {
          t.scale = 1.1 - (progress - 0.15) * 0.15;
        }
        if (t.life <= 0) active.splice(i, 1);
      }
    },

    render(ctx) {
      for (const item of active) {
        const alpha = Math.max(0, Math.min(1, item.life / (item.maxLife * 0.35)));
        const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.bio;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(item.scale, item.scale);

        ctx.font = 'bold 14px "JetBrains Mono", Consolas, monospace';
        ctx.textAlign = 'center';

        // Outer Dark Border
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgba(5, 5, 16, ${alpha * 0.95})`;
        ctx.strokeText(item.text, 0, 0);

        // Glowing Core Fill
        ctx.fillStyle = `hsla(${cat.h}, ${cat.s}%, ${cat.l}%, ${alpha})`;
        ctx.fillText(item.text, 0, 0);

        ctx.restore();
      }
    },
  };
}
