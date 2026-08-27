# i18n + Click Texts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-language support (EN/RU/DE) and funny click text system with culturally adapted humor.

**Architecture:** Flat key-value locale files with a `t(key, params)` function. Click texts as separate categorized pools per language. Both systems share the locale state stored in localStorage.

**Tech Stack:** Vanilla JS, no i18n libraries.

---

## File Structure

```
src/i18n/
├── i18n.js              — Core: locale detection, t() function, setLocale()
├── locales/
│   ├── en.js            — English UI strings (~40 keys)
│   ├── ru.js            — Russian UI strings
│   └── de.js            — German UI strings
src/data/
├── texts-en.js          — English click text pools (10 categories, 300+ strings)
├── texts-ru.js          — Russian click text pools
└── texts-de.js          — German click text pools
src/ui/
├── ClickTexts.js        — Click text system: trigger logic, pool selection, rendering
└── LanguageSwitcher.js  — [EN][RU][DE] buttons in top-left
```

---

### Task 1: i18n Core Module

**Files:**
- Create: `src/i18n/i18n.js`

- [ ] **Step 1: Create i18n.js with t() function and locale management**

```js
// src/i18n/i18n.js
let strings = {};
let fallback = {};
let currentLocale = 'en';

const SUPPORTED = ['en', 'ru', 'de'];
const STORAGE_KEY = 'screencreep_locale';

export function initI18n(savedLocale = null) {
  currentLocale = savedLocale
    || localStorage.getItem(STORAGE_KEY)
    || detectBrowserLocale()
    || 'en';
  return loadLocale(currentLocale);
}

export function t(key, params = {}) {
  let str = strings[key] || fallback[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

export function getLocale() {
  return currentLocale;
}

export async function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return;
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  await loadLocale(locale);
}

function detectBrowserLocale() {
  const lang = navigator.language.slice(0, 2);
  return SUPPORTED.includes(lang) ? lang : null;
}

async function loadLocale(locale) {
  const mod = await import(`./locales/${locale}.js`);
  strings = mod.default;
  if (locale !== 'en') {
    const enMod = await import('./locales/en.js');
    fallback = enMod.default;
  } else {
    fallback = {};
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/i18n.js
git commit -m "feat: add i18n core module with t() function and locale detection"
```

---

### Task 2: English Locale File

**Files:**
- Create: `src/i18n/locales/en.js`

- [ ] **Step 1: Create en.js with all UI strings**

```js
// src/i18n/locales/en.js
export default {
  // Stage names
  'stage.seed': 'Seed',
  'stage.growth': 'Growth',
  'stage.breach': 'Breach',
  'stage.takeover': 'Takeover',
  'stage.domination': 'Domination',

  // UI
  'ui.upgrades': 'UPGRADES',
  'ui.stage_format': 'Stage {n}: {name}',
  'ui.achievement': 'Achievement: {name}',
  'ui.frenzy': 'x{mult} FRENZY — {time}s',

  // Hints
  'hint.click_cell': 'click the cell',

  // Sound
  'sound.on': 'sound: on',
  'sound.off': 'sound: off',

  // Upgrades
  'upgrade.autoClicker.name': 'Auto Clicker',
  'upgrade.autoClicker.desc': '+1 pixel/sec',
  'upgrade.clickMultiplier.name': 'Click Power',
  'upgrade.clickMultiplier.desc': 'x2 per click',
  'upgrade.autoSpeed.name': 'Auto Speed',
  'upgrade.autoSpeed.desc': '+50% auto rate',
  'upgrade.cellDivision.name': 'Cell Division',
  'upgrade.cellDivision.desc': '+1 cell per click',
  'upgrade.organGrowth.name': 'Organ Growth',
  'upgrade.organGrowth.desc': 'x3 passive income',
  'upgrade.sporeChance.name': 'Spore Magnet',
  'upgrade.sporeChance.desc': 'Golden spores 2x more frequent',
  'upgrade.neuralLink.name': 'Neural Link',
  'upgrade.neuralLink.desc': 'x2 all production',
  'upgrade.membrane.name': 'Membrane',
  'upgrade.membrane.desc': '+10% offline earnings',
  'upgrade.locked': '(need Auto Clicker)',

  // Milestones
  'milestone.cellGrow': 'First Growth',
  'milestone.firstCytoplasm': 'Cytoplasm Awakens',
  'milestone.membraneWobble': 'Membrane Pulse',
  'milestone.cyanCell': 'New Species: Cyan',
  'milestone.purpleOrganelle': 'Mutation: Purple',
  'milestone.membraneBridges': 'Colony Connected',
  'milestone.goldOrganelle': 'Mutation: Gold',
  'milestone.firstTendril': 'First Tendril',
  'milestone.backgroundShift': 'Environment Shift',
  'milestone.halfViewport': 'Half Consumed',

  // Golden Spore
  'spore.frenzy': 'FRENZY! x7 for 30s',
  'spore.lucky': 'LUCKY! +{n} px',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/locales/en.js
git commit -m "feat: add English locale file"
```

---

### Task 3: Russian and German Locale Files

**Files:**
- Create: `src/i18n/locales/ru.js`
- Create: `src/i18n/locales/de.js`

- [ ] **Step 1: Create ru.js**

```js
// src/i18n/locales/ru.js
export default {
  'stage.seed': 'Зародыш',
  'stage.growth': 'Рост',
  'stage.breach': 'Прорыв',
  'stage.takeover': 'Захват',
  'stage.domination': 'Доминация',

  'ui.upgrades': 'АПГРЕЙДЫ',
  'ui.stage_format': 'Стадия {n}: {name}',
  'ui.achievement': 'Достижение: {name}',
  'ui.frenzy': 'x{mult} БЕШЕНСТВО — {time}с',

  'hint.click_cell': 'кликни по клетке',

  'sound.on': 'звук: вкл',
  'sound.off': 'звук: выкл',

  'upgrade.autoClicker.name': 'Авто-кликер',
  'upgrade.autoClicker.desc': '+1 пиксель/сек',
  'upgrade.clickMultiplier.name': 'Сила клика',
  'upgrade.clickMultiplier.desc': 'x2 за клик',
  'upgrade.autoSpeed.name': 'Авто-скорость',
  'upgrade.autoSpeed.desc': '+50% авто-скорость',
  'upgrade.cellDivision.name': 'Деление клеток',
  'upgrade.cellDivision.desc': '+1 клетка за клик',
  'upgrade.organGrowth.name': 'Рост органов',
  'upgrade.organGrowth.desc': 'x3 пассивный доход',
  'upgrade.sporeChance.name': 'Магнит спор',
  'upgrade.sporeChance.desc': 'Золотые споры x2 чаще',
  'upgrade.neuralLink.name': 'Нейросвязь',
  'upgrade.neuralLink.desc': 'x2 всё производство',
  'upgrade.membrane.name': 'Мембрана',
  'upgrade.membrane.desc': '+10% офлайн-доход',
  'upgrade.locked': '(нужен Авто-кликер)',

  'milestone.cellGrow': 'Первый рост',
  'milestone.firstCytoplasm': 'Цитоплазма проснулась',
  'milestone.membraneWobble': 'Пульс мембраны',
  'milestone.cyanCell': 'Новый вид: Циан',
  'milestone.purpleOrganelle': 'Мутация: Фиолетовый',
  'milestone.membraneBridges': 'Колония связана',
  'milestone.goldOrganelle': 'Мутация: Золото',
  'milestone.firstTendril': 'Первое щупальце',
  'milestone.backgroundShift': 'Среда меняется',
  'milestone.halfViewport': 'Половина поглощена',

  'spore.frenzy': 'БЕШЕНСТВО! x7 на 30с',
  'spore.lucky': 'УДАЧА! +{n} px',
};
```

- [ ] **Step 2: Create de.js**

```js
// src/i18n/locales/de.js
export default {
  'stage.seed': 'Keim',
  'stage.growth': 'Wachstum',
  'stage.breach': 'Durchbruch',
  'stage.takeover': 'Übernahme',
  'stage.domination': 'Herrschaft',

  'ui.upgrades': 'UPGRADES',
  'ui.stage_format': 'Stufe {n}: {name}',
  'ui.achievement': 'Errungenschaft: {name}',
  'ui.frenzy': 'x{mult} RASEREI — {time}s',

  'hint.click_cell': 'klick die Zelle',

  'sound.on': 'Ton: an',
  'sound.off': 'Ton: aus',

  'upgrade.autoClicker.name': 'Auto-Klicker',
  'upgrade.autoClicker.desc': '+1 Pixel/Sek',
  'upgrade.clickMultiplier.name': 'Klick-Power',
  'upgrade.clickMultiplier.desc': 'x2 pro Klick',
  'upgrade.autoSpeed.name': 'Auto-Tempo',
  'upgrade.autoSpeed.desc': '+50% Auto-Rate',
  'upgrade.cellDivision.name': 'Zellteilung',
  'upgrade.cellDivision.desc': '+1 Zelle pro Klick',
  'upgrade.organGrowth.name': 'Organwachstum',
  'upgrade.organGrowth.desc': 'x3 passives Einkommen',
  'upgrade.sporeChance.name': 'Spormagnet',
  'upgrade.sporeChance.desc': 'Goldsporen 2x häufiger',
  'upgrade.neuralLink.name': 'Neuralverbindung',
  'upgrade.neuralLink.desc': 'x2 gesamte Produktion',
  'upgrade.membrane.name': 'Membran',
  'upgrade.membrane.desc': '+10% Offline-Ertrag',
  'upgrade.locked': '(Auto-Klicker nötig)',

  'milestone.cellGrow': 'Erstes Wachstum',
  'milestone.firstCytoplasm': 'Zytoplasma erwacht',
  'milestone.membraneWobble': 'Membranpuls',
  'milestone.cyanCell': 'Neue Art: Cyan',
  'milestone.purpleOrganelle': 'Mutation: Violett',
  'milestone.membraneBridges': 'Kolonie verbunden',
  'milestone.goldOrganelle': 'Mutation: Gold',
  'milestone.firstTendril': 'Erster Tentakel',
  'milestone.backgroundShift': 'Umgebungswandel',
  'milestone.halfViewport': 'Halb verschlungen',

  'spore.frenzy': 'RASEREI! x7 für 30s',
  'spore.lucky': 'GLÜCK! +{n} px',
};
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/locales/ru.js src/i18n/locales/de.js
git commit -m "feat: add Russian and German locale files"
```

---

### Task 4: Wire i18n into Existing Code

**Files:**
- Modify: `src/main.js`
- Modify: `src/ui/UIPanel.js`
- Modify: `src/stages/Stage1_Seed.js`
- Modify: `src/meta/GoldenSpore.js`
- Modify: `src/game/Upgrades.js`

- [ ] **Step 1: Make main.js async and init i18n**

At top of `src/main.js`, add import:
```js
import { initI18n, t, getLocale } from './i18n/i18n.js';
```

Wrap the entire init logic in an async IIFE (or top-level await if Vite supports it). Add `await initI18n();` before any UI creation.

- [ ] **Step 2: Replace hardcoded strings in main.js**

Replace `milestoneNames` object (lines 171-182):
```js
// Remove the milestoneNames object entirely.
// Replace usage at line 239:
const displayName = t(`milestone.${name}`);
toasts.show(t('ui.achievement', { name: displayName }), '#00ff88');
```

Replace stage advance toast (line 319):
```js
const stageName = t(`stage.${['', 'seed', 'growth', 'breach', 'takeover', 'domination'][state.stage]}`);
toasts.show(t('ui.stage_format', { n: state.stage, name: stageName }), '#ffcc00');
```

Replace frenzy indicator (line 311):
```js
ctx.fillText(t('ui.frenzy', { mult: bonus.multiplier, time: Math.ceil(bonus.timeLeft) }), canvas.width / 2, 30);
```

Replace mute button text (line 63):
```js
muteBtn.textContent = soundEngine.isMuted() ? t('sound.off') : t('sound.on');
```

- [ ] **Step 3: Replace hardcoded strings in UIPanel.js**

In `renderPanel` function, replace:
- `stageNames` object → use `t('stage.seed')`, etc.
- `'UPGRADES'` → `t('ui.upgrades')`
- `def.label` → `t('upgrade.' + id + '.name')`
- `def.description` → `t('upgrade.' + id + '.desc')`
- `'(need Auto Clicker)'` → `t('upgrade.locked')`

Stage display line:
```js
const stageName = t(`stage.${['', 'seed', 'growth', 'breach', 'takeover', 'domination'][state.stage]}`);
// Use: Stage ${state.stage}: ${stageName}
```

Import `t` at top:
```js
import { t } from '../i18n/i18n.js';
```

- [ ] **Step 4: Replace hardcoded strings in Stage1_Seed.js**

```js
import { t } from '../i18n/i18n.js';
// line 25: replace 'click the cell' with t('hint.click_cell')
ctx.fillText(t('hint.click_cell'), canvasW / 2, canvasH - 20);
```

- [ ] **Step 5: Replace hardcoded strings in GoldenSpore.js**

```js
import { t } from '../i18n/i18n.js';
// line 113: replace 'FRENZY! x7 for 30s' with t('spore.frenzy')
return { type: 'frenzy', message: t('spore.frenzy') };
// line 117: replace template string with t('spore.lucky', { n: formatShort(bonus) })
return { type: 'lucky', amount: bonus, message: t('spore.lucky', { n: formatShort(bonus) }) };
```

- [ ] **Step 6: Test in browser**

Run: `npx vite` (or however dev server is started)
Open Chrome, verify:
1. All upgrade labels display correctly
2. Stage names show in detected language
3. Milestones show translated names
4. Mute button text is translated
5. Golden spore messages are translated

- [ ] **Step 7: Commit**

```bash
git add src/main.js src/ui/UIPanel.js src/stages/Stage1_Seed.js src/meta/GoldenSpore.js
git commit -m "feat: wire i18n into all UI strings"
```

---

### Task 5: Language Switcher UI

**Files:**
- Create: `src/ui/LanguageSwitcher.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create LanguageSwitcher.js**

```js
// src/ui/LanguageSwitcher.js
import { getLocale, setLocale } from '../i18n/i18n.js';

export function createLanguageSwitcher(onLocaleChange) {
  const el = document.createElement('div');
  el.id = 'lang-switcher';
  el.style.cssText = 'position:fixed;top:8px;left:8px;z-index:1000;display:flex;gap:4px;';

  const locales = ['en', 'ru', 'de'];

  function render() {
    const current = getLocale();
    el.innerHTML = locales.map(loc => {
      const active = loc === current;
      return `<button data-lang="${loc}" style="
        background:${active ? 'rgba(0,255,136,0.15)' : 'rgba(0,0,0,0.3)'};
        border:1px solid ${active ? '#00ff88' : '#333'};
        color:${active ? '#00ff88' : '#666'};
        padding:2px 6px;font-size:10px;font-family:monospace;
        cursor:pointer;border-radius:3px;
      ">${loc.toUpperCase()}</button>`;
    }).join('');
  }

  el.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    await setLocale(btn.dataset.lang);
    render();
    if (onLocaleChange) onLocaleChange();
  });

  render();
  document.body.appendChild(el);

  return { el, render };
}
```

- [ ] **Step 2: Wire into main.js**

Add import:
```js
import { createLanguageSwitcher } from './ui/LanguageSwitcher.js';
```

After `await initI18n()`, add:
```js
const langSwitcher = createLanguageSwitcher(() => {
  // Force UI re-render on locale change
  uiPanel.update();
});
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/LanguageSwitcher.js src/main.js
git commit -m "feat: add language switcher UI (EN/RU/DE)"
```

---

### Task 6: English Click Text Pools

**Files:**
- Create: `src/data/texts-en.js`

- [ ] **Step 1: Create texts-en.js with all 10 categories**

```js
// src/data/texts-en.js
export default {
  bio: [
    "Cell division: now in stereo",
    "Mitosis? More like my-toe-sis",
    "That's one small click for a cell",
    "Natural selection chose violence",
    "Survival of the clickest",
    "Your cells called. They want overtime pay",
    "Reproducing... asexually, of course",
    "Evolution speedrun any%",
    "Darwin would be confused",
    "Organic growth, inorganic effort",
    "Biomass: increasing",
    "Cytoplasm go brrr",
    "The mitochondria is the powerhouse",
    "DNA? More like D-N-YAY",
    "Flagella? I barely know 'er",
    "Photosynthesis machine broke",
    "Peer-reviewed and approved",
    "Lab results: inconclusive but fun",
    "Side effects may include: addiction",
    "Not FDA approved",
    "Organic, free-range pixels",
    "Cell membrane: load-bearing",
    "Osmosis Jones would be proud",
    "This cell identifies as a colony",
    "Mitochondrial rights!",
    "Petri dish? More like petri WISH",
    "Hypothesis: more clicks = more science",
    "Biology was never this violent",
    "Sir, this is a cytoplasm",
    "Cellular respiration intensifies",
  ],

  meta: [
    "I know you're just clicking mindlessly",
    "This is a game. You are playing it.",
    "Your click was mass-produced",
    "Achievement: clicked a thing",
    "Plot twist: the cells are clicking you",
    "You could be doing literally anything else",
    "Your mouse will remember this",
    "The developer thanks your click",
    "This text was procedurally generated*",
    "*it wasn't, someone typed this",
    "You're speedrunning aren't you",
    "The leaderboard is just you",
    "Save file corrupted. Just kidding.",
    "Loading fun... 78%",
    "Pixel #4829. They all count.",
    "You looked at this text instead of clicking",
    "The tutorial never ends",
    "No refunds",
    "This click was sponsored by nobody",
    "You are now manually breathing",
    "Congrats, you found the secret text",
    "There is no secret text",
    "The game plays you",
    "Your ISP sees this",
    "This tab is now sentient",
    "Alt+F4 for double pixels*",
    "*please don't",
    "The devtools can't help you",
    "Inspect element reveals nothing",
    "You read faster than you click",
  ],

  existential: [
    "Does the cell click you?",
    "What if the pixels are the friends we made",
    "Growth is just structured decay",
    "We are all just clicking in the void",
    "The organism doesn't judge you",
    "Is this... sentience?",
    "Meaning was never the point",
    "Even the void needs hobbies",
    "The cells do not dream",
    "Purpose is a human construct. Click.",
    "Free will is questionable. Clicking isn't.",
    "Are you the player or the played?",
    "Nothing matters but it clicks anyway",
    "You started this. It can't stop now.",
    "Consciousness is just cells clicking",
    "Entropy wins eventually. But not today.",
    "The cell wonders about you too",
    "What does the pixel become?",
    "Growth without purpose is just cancer",
    "Are we the baddies?",
  ],

  glitch: [
    "ERR: too much biomass [OK]",
    "segfault in membrane.exe",
    "WARN: fourth wall integrity: 12%",
    "NaN pixels earned (that's a lot)",
    "undefined is not a function (but you are)",
    "TypeError: happiness is not iterable",
    "kernel panic: organism too powerful",
    "sudo rm -rf boundaries",
    "[REDACTED]",
    "stack overflow in growth.js",
    "out of memory (organism ate it)",
    "404: meaning not found",
    "git commit -m 'help'",
    "localhost:3000 is leaking",
    "npm install more-cells",
    "ERROR: canvas cannot contain this",
    "buffer overflow in click_handler",
    "FATAL: too many cells, not enough pixels",
    "WARN: pixel overflow imminent",
    "Uncaught BiomassError: too organic",
  ],

  aggressive: [
    "Stop. Poking. Me.",
    "I FELT that",
    "Okay that one hurt",
    "Do you click your mother with that finger?",
    "Personal space? No?",
    "I'm a living organism, not a button",
    "Keep clicking. See what happens.",
    "You think this is a game? ...it is.",
    "My membrane has feelings too",
    "I will remember this",
    "The organism is annoyed",
    "Click harder. I dare you.",
    "Was that supposed to hurt?",
    "Three more clicks and I file a complaint",
    "Assault charges pending",
  ],

  cosmic: [
    "The membrane between worlds thins",
    "Something stirs beyond the viewport",
    "The old ones click in their sleep",
    "Ph'nglui mglw'nafh Ctrl+Click R'lyeh",
    "You have been noticed",
    "The screen is just a window",
    "It was always here. You just couldn't see it.",
    "Dimension breach: nominal",
    "The stars are just dead pixels",
    "Your clicks echo in the deep",
    "Something clicks back",
    "The organism remembers other sessions",
    "There is no screen. Only membrane.",
    "It grows between the tabs",
    "Behind every pixel, something watches",
  ],

  frenzy: [
    "AAAAAAA",
    "slow DOWN",
    "calm down satan",
    "the organism is dizzy",
    "click click click click click",
    "your mouse: 'please stop'",
    "RSI SPEEDRUN",
    "MAXIMUM OVERDRIVE",
    "CLICKING INTENSIFIES",
    "you good?",
    "that's illegal in 7 countries",
    "this is beyond science",
    "keyboard warriors have nothing on you",
    "the clicks are coming from inside the house",
    "ok ok OK I'M GROWING",
  ],

  milestone: [
    "First blood",
    "It begins",
    "Growth unlocked",
    "Evolving...",
    "New form acquired",
    "The colony stirs",
    "Connections forming",
    "Reaching out...",
    "The world shifts",
    "Halfway there",
  ],

  golden: [
    "JACKPOT",
    "Shiny!",
    "The chosen spore",
    "Liquid gold",
    "Fortune favors the clicker",
    "Golden ratio achieved",
    "Midas touch",
    "Ka-ching!",
    "Organic lottery winner",
    "The spore smiles upon you",
  ],

  combo: [
    "COMBO x{n}!",
    "Keep it up!",
    "Chain reaction",
    "Multiplying...",
    "Synergy!",
    "Click chain!",
    "Cascade!",
    "Resonance!",
    "Flow state",
    "In the zone",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/texts-en.js
git commit -m "feat: add English click text pools (10 categories, 200+ texts)"
```

---

### Task 7: Russian and German Click Text Pools

**Files:**
- Create: `src/data/texts-ru.js`
- Create: `src/data/texts-de.js`

- [ ] **Step 1: Create texts-ru.js**

```js
// src/data/texts-ru.js
export default {
  bio: [
    "Деление клеток: теперь в стерео",
    "Митоз? Больше похоже на мой-тоз",
    "Один маленький клик для клетки",
    "Естественный отбор выбрал насилие",
    "Выживает кликнувший",
    "Твои клетки звонили. Хотят сверхурочные",
    "Размножение... бесполое, конечно",
    "Эволюция спидран any%",
    "Дарвин бы запутался",
    "Органический рост, неорганические усилия",
    "Биомасса: увеличивается",
    "Цитоплазма go brrr",
    "Митохондрия — энергостанция клетки",
    "ДНК? Больше похоже на Д-Н-ДА",
    "Жгутики? Какие ещё жгутики?",
    "Фотосинтез сломался",
    "Рецензировано и одобрено",
    "Результаты анализов: непонятно, но весело",
    "Побочные эффекты: зависимость",
    "Минздрав не одобряет",
    "Органические, фермерские пиксели",
    "Клеточная мембрана: несущая стена",
    "Это не баг, это мутация",
    "Эта клетка самоидентифицируется как колония",
    "Права митохондрий!",
    "Чашка Петри? Больше как чашка мечты",
    "Гипотеза: больше кликов = больше науки",
    "Биология никогда не была такой жестокой",
    "Сэр, это цитоплазма",
    "Клеточное дыхание усиливается",
  ],

  meta: [
    "Я знаю, что ты кликаешь бездумно",
    "Это игра. Ты в неё играешь.",
    "Твой клик был массовым продуктом",
    "Достижение: кликнул на штуку",
    "Поворот сюжета: клетки кликают по тебе",
    "Ты мог бы заниматься чем угодно другим",
    "Твоя мышка запомнит это",
    "Разработчик благодарит твой клик",
    "Этот текст сгенерирован процедурно*",
    "*нет, кто-то это напечатал",
    "Спидранишь, да?",
    "Таблица лидеров — это только ты",
    "Сохранение повреждено. Шучу.",
    "Загрузка веселья... 78%",
    "Пиксель #4829. Все считаются.",
    "Ты прочитал это вместо того чтобы кликать",
    "Туториал никогда не кончается",
    "Возврату не подлежит",
    "Этот клик никто не спонсировал",
    "Ты теперь дышишь вручную",
    "Поздравляю, ты нашёл секретный текст",
    "Секретного текста нет",
    "Игра играет в тебя",
    "Твой провайдер видит это",
    "Эта вкладка теперь разумна",
    "Alt+F4 для удвоения пикселей*",
    "*пожалуйста, не надо",
    "DevTools тебе не помогут",
    "Inspect element ничего не покажет",
    "Ты читаешь быстрее, чем кликаешь",
  ],

  existential: [
    "Клетка кликает по тебе?",
    "Что если пиксели — это друзья, которых мы нашли",
    "Рост — это структурированный распад",
    "Мы все просто кликаем в пустоту",
    "Организм тебя не осуждает",
    "Это... разум?",
    "Смысл никогда не был главным",
    "Даже пустоте нужны хобби",
    "Клетки не видят снов",
    "Цель — человеческий конструкт. Кликай.",
    "Свобода воли сомнительна. Клики — нет.",
    "Ты игрок или играемый?",
    "Ничто не имеет значения, но кликается всё равно",
    "Ты это начал. Оно не может остановиться.",
    "Сознание — это просто клетки кликают",
    "Энтропия победит. Но не сегодня.",
    "Клетка тоже думает о тебе",
    "Чем станет пиксель?",
    "Рост без цели — это просто рак",
    "Мы вообще хорошие?",
  ],

  glitch: [
    "ERR: слишком много биомассы [OK]",
    "segfault в membrane.exe",
    "WARN: целостность четвёртой стены: 12%",
    "NaN пикселей (это много)",
    "undefined is not a function (но ты — да)",
    "TypeError: счастье не итерируемо",
    "kernel panic: организм слишком мощный",
    "sudo rm -rf границы",
    "[УДАЛЕНО]",
    "stack overflow в growth.js",
    "нехватка памяти (организм съел)",
    "404: смысл не найден",
    "git commit -m 'помогите'",
    "localhost:3000 протекает",
    "npm install больше-клеток",
    "ERROR: canvas не вмещает это",
    "buffer overflow в click_handler",
    "FATAL: слишком много клеток, мало пикселей",
    "WARN: переполнение пикселей неизбежно",
    "Uncaught BiomassError: слишком органично",
  ],

  aggressive: [
    "Хватит. Тыкать. В меня.",
    "Я это ЧУВСТВУЮ",
    "Ладно, это больно",
    "Ты так же маму свою кликаешь?",
    "Личное пространство? Нет?",
    "Я живой организм, а не кнопка",
    "Продолжай кликать. Посмотрим что будет.",
    "Ты думаешь это игра? ...ну да.",
    "У моей мембраны тоже есть чувства",
    "Я это запомню",
    "Организм раздражён",
    "Кликай сильнее. Я вызываю.",
    "Это должно было быть больно?",
    "Ещё три клика и я подам жалобу",
    "Обвинение в нападении в процессе",
  ],

  cosmic: [
    "Мембрана между мирами истончается",
    "Что-то шевелится за viewport'ом",
    "Древние кликают во сне",
    "Ph'nglui mglw'nafh Ctrl+Click R'lyeh",
    "Тебя заметили",
    "Экран — это просто окно",
    "Оно всегда было здесь. Ты просто не видел.",
    "Прорыв измерения: штатный",
    "Звёзды — это просто мёртвые пиксели",
    "Твои клики эхом разносятся в глубине",
    "Что-то кликает в ответ",
    "Организм помнит другие сессии",
    "Нет никакого экрана. Только мембрана.",
    "Оно растёт между вкладками",
    "За каждым пикселем что-то наблюдает",
  ],

  frenzy: [
    "АААААА",
    "ТИШЕ ты",
    "успокойся, сатана",
    "организму плохо",
    "клик клик клик клик клик",
    "твоя мышка: 'хватит пожалуйста'",
    "RSI СПИДРАН",
    "МАКСИМАЛЬНЫЙ ОВЕРДРАЙВ",
    "КЛИКАНЬЕ УСИЛИВАЕТСЯ",
    "ты в порядке?",
    "это нелегально в 7 странах",
    "это за гранью науки",
    "ты кликаешь быстрее чем думаешь",
    "клики идут изнутри дома",
    "ладно ладно ЛАДНО Я РАСТУ",
  ],

  milestone: [
    "Первая кровь",
    "Начинается",
    "Рост разблокирован",
    "Эволюция...",
    "Новая форма получена",
    "Колония шевелится",
    "Связи формируются",
    "Тянемся...",
    "Мир смещается",
    "На полпути",
  ],

  golden: [
    "ДЖЕКПОТ",
    "Блестяшка!",
    "Избранная спора",
    "Жидкое золото",
    "Фортуна любит кликеров",
    "Золотое сечение достигнуто",
    "Прикосновение Мидаса",
    "Ка-чинг!",
    "Органический победитель лотереи",
    "Спора тебе улыбается",
  ],

  combo: [
    "КОМБО x{n}!",
    "Продолжай!",
    "Цепная реакция",
    "Множится...",
    "Синергия!",
    "Цепь кликов!",
    "Каскад!",
    "Резонанс!",
    "Состояние потока",
    "В ударе",
  ],
};
```

- [ ] **Step 2: Create texts-de.js**

```js
// src/data/texts-de.js
export default {
  bio: [
    "Zellteilung: jetzt in Stereo",
    "Mitose? Eher MEIN-tose",
    "Ein kleiner Klick für eine Zelle",
    "Natürliche Selektion wählte Gewalt",
    "Überleben des Klickstärksten",
    "Deine Zellen haben angerufen. Sie wollen Überstunden",
    "Vermehrung... ungeschlechtlich, natürlich",
    "Evolution Speedrun any%",
    "Darwin wäre verwirrt",
    "Organisches Wachstum, anorganischer Aufwand",
    "Biomasse: steigend",
    "Zytoplasma geht brrr",
    "Mitochondrien sind das Kraftwerk der Zelle",
    "DNS? Eher D-N-JA",
    "Geißeln? Welche Geißeln?",
    "Photosynthese kaputt",
    "Peer-reviewed und genehmigt",
    "Laborergebnisse: unklar aber lustig",
    "Nebenwirkungen: Sucht",
    "Nicht vom TÜV geprüft",
    "Bio-Pixel aus Freilandhaltung",
    "Zellmembran: tragend",
    "Das ist kein Bug, das ist eine Mutation",
    "Diese Zelle identifiziert sich als Kolonie",
    "Mitochondrienrechte!",
    "Petrischale? Eher Petri-WUNSCH",
    "Hypothese: mehr Klicks = mehr Wissenschaft",
    "Biologie war nie so brutal",
    "Mein Herr, dies ist ein Zytoplasma",
    "Zellatmung intensiviert sich",
  ],

  meta: [
    "Ich weiß, dass du gedankenlos klickst",
    "Das ist ein Spiel. Du spielst es.",
    "Dein Klick war Massenware",
    "Errungenschaft: auf ein Ding geklickt",
    "Plot Twist: die Zellen klicken dich",
    "Du könntest buchstäblich alles andere tun",
    "Deine Maus wird sich erinnern",
    "Der Entwickler dankt für deinen Klick",
    "Dieser Text wurde prozedural generiert*",
    "*wurde er nicht, jemand hat das getippt",
    "Du speedrunnst, oder?",
    "Die Bestenliste bist nur du",
    "Spielstand beschädigt. Scherz.",
    "Spaß wird geladen... 78%",
    "Pixel #4829. Alle zählen.",
    "Du hast das gelesen statt zu klicken",
    "Das Tutorial endet nie",
    "Keine Rückgabe",
    "Dieser Klick wurde von niemandem gesponsert",
    "Du atmest jetzt manuell",
    "Glückwunsch, du hast den geheimen Text gefunden",
    "Es gibt keinen geheimen Text",
    "Das Spiel spielt dich",
    "Dein ISP sieht das",
    "Dieser Tab ist jetzt intelligent",
    "Alt+F4 für doppelte Pixel*",
    "*bitte nicht",
    "DevTools helfen dir nicht",
    "Element untersuchen zeigt nichts",
    "Du liest schneller als du klickst",
  ],

  existential: [
    "Klickt die Zelle dich?",
    "Was wenn die Pixel die Freunde sind, die wir fanden",
    "Wachstum ist nur strukturierter Zerfall",
    "Wir klicken alle nur ins Leere",
    "Der Organismus urteilt nicht über dich",
    "Ist das... Bewusstsein?",
    "Sinn war nie der Punkt",
    "Sogar die Leere braucht Hobbys",
    "Die Zellen träumen nicht",
    "Zweck ist ein menschliches Konstrukt. Klick.",
    "Freier Wille ist fraglich. Klicken nicht.",
    "Bist du der Spieler oder der Gespielte?",
    "Nichts zählt, aber es klickt trotzdem",
    "Du hast das angefangen. Es kann nicht aufhören.",
    "Bewusstsein ist nur Zellen, die klicken",
    "Entropie gewinnt irgendwann. Aber nicht heute.",
    "Die Zelle denkt auch an dich",
    "Was wird aus dem Pixel?",
    "Wachstum ohne Zweck ist einfach nur Krebs",
    "Sind wir die Bösen?",
  ],

  glitch: [
    "ERR: zu viel Biomasse [OK]",
    "segfault in membrane.exe",
    "WARN: Integrität der vierten Wand: 12%",
    "NaN Pixel verdient (das ist viel)",
    "undefined is not a function (aber du schon)",
    "TypeError: Glück ist nicht iterierbar",
    "kernel panic: Organismus zu mächtig",
    "sudo rm -rf Grenzen",
    "[GESCHWÄRZT]",
    "stack overflow in growth.js",
    "Speicher voll (Organismus hat ihn gefressen)",
    "404: Sinn nicht gefunden",
    "git commit -m 'Hilfe'",
    "localhost:3000 leckt",
    "npm install mehr-zellen",
    "ERROR: Canvas kann das nicht fassen",
    "buffer overflow in click_handler",
    "FATAL: zu viele Zellen, zu wenig Pixel",
    "WARN: Pixelüberlauf steht bevor",
    "Uncaught BiomassError: zu organisch",
  ],

  aggressive: [
    "Hör. Auf. Mich. Zu. Piksen.",
    "Ich hab das GESPÜRT",
    "Okay das tat weh",
    "Klickst du deine Mutter auch so?",
    "Persönlicher Raum? Nein?",
    "Ich bin ein lebender Organismus, kein Knopf",
    "Klick weiter. Mal sehen was passiert.",
    "Du denkst das ist ein Spiel? ...ist es.",
    "Meine Membran hat auch Gefühle",
    "Ich werde mich daran erinnern",
    "Der Organismus ist genervt",
    "Klick härter. Ich fordere dich heraus.",
    "Sollte das wehtun?",
    "Noch drei Klicks und ich erstatte Anzeige",
    "Körperverletzung wird geprüft",
  ],

  cosmic: [
    "Die Membran zwischen Welten wird dünner",
    "Etwas regt sich hinter dem Viewport",
    "Die Alten klicken in ihrem Schlaf",
    "Ph'nglui mglw'nafh Ctrl+Click R'lyeh",
    "Du wurdest bemerkt",
    "Der Bildschirm ist nur ein Fenster",
    "Es war immer hier. Du konntest es nur nicht sehen.",
    "Dimensionsbruch: nominal",
    "Die Sterne sind nur tote Pixel",
    "Deine Klicks hallen in der Tiefe",
    "Etwas klickt zurück",
    "Der Organismus erinnert sich an andere Sitzungen",
    "Es gibt keinen Bildschirm. Nur Membran.",
    "Es wächst zwischen den Tabs",
    "Hinter jedem Pixel beobachtet etwas",
  ],

  frenzy: [
    "AAAAAAA",
    "LANGSAM",
    "beruhig dich, Satan",
    "dem Organismus ist schwindelig",
    "klick klick klick klick klick",
    "deine Maus: 'bitte aufhören'",
    "RSI SPEEDRUN",
    "MAXIMALER OVERDRIVE",
    "KLICKEN INTENSIVIERT SICH",
    "alles gut bei dir?",
    "das ist in 7 Ländern illegal",
    "das ist jenseits der Wissenschaft",
    "Tastaturkrieger haben nichts gegen dich",
    "die Klicks kommen aus dem Haus",
    "ok ok OK ICH WACHSE",
  ],

  milestone: [
    "Erstes Blut",
    "Es beginnt",
    "Wachstum freigeschaltet",
    "Evolution...",
    "Neue Form erworben",
    "Die Kolonie regt sich",
    "Verbindungen entstehen",
    "Ausstrecken...",
    "Die Welt verschiebt sich",
    "Auf halbem Weg",
  ],

  golden: [
    "JACKPOT",
    "Glänzend!",
    "Die auserwählte Spore",
    "Flüssiges Gold",
    "Fortuna liebt Klicker",
    "Goldener Schnitt erreicht",
    "Midas-Berührung",
    "Ka-tsching!",
    "Organischer Lottogewinner",
    "Die Spore lächelt dich an",
  ],

  combo: [
    "COMBO x{n}!",
    "Weiter so!",
    "Kettenreaktion",
    "Vermehrung...",
    "Synergie!",
    "Klickkette!",
    "Kaskade!",
    "Resonanz!",
    "Flow-Zustand",
    "In der Zone",
  ],
};
```

- [ ] **Step 3: Commit**

```bash
git add src/data/texts-ru.js src/data/texts-de.js
git commit -m "feat: add Russian and German click text pools"
```

---

### Task 8: ClickTexts System

**Files:**
- Create: `src/ui/ClickTexts.js`

- [ ] **Step 1: Create ClickTexts.js with trigger logic, pool selection, and rendering**

```js
// src/ui/ClickTexts.js
import { getLocale } from '../i18n/i18n.js';

const TRIGGER_CHANCE = 0.15;
const COOLDOWN = 3;
const MAX_ACTIVE = 5;
const FRENZY_STREAK = 10;

const STAGE_POOLS = {
  1: ['bio'],
  2: ['bio', 'meta'],
  3: ['bio', 'meta', 'existential', 'glitch'],
  4: ['bio', 'meta', 'existential', 'glitch', 'aggressive'],
  5: ['bio', 'meta', 'existential', 'glitch', 'aggressive', 'cosmic'],
};

const CATEGORY_COLORS = {
  bio:          { h: 140, s: 80, l: 70 },
  meta:         { h: 200, s: 60, l: 80 },
  existential:  { h: 270, s: 60, l: 80 },
  glitch:       { h: 0,   s: 0,  l: 90 },
  aggressive:   { h: 0,   s: 80, l: 65 },
  cosmic:       { h: 280, s: 90, l: 70 },
  frenzy:       { h: 50,  s: 100, l: 60 },
  milestone:    { h: 45,  s: 100, l: 55 },
  golden:       { h: 45,  s: 100, l: 60 },
  combo:        { h: 0,   s: 80, l: 70 },  // rainbow override in render
};

export function createClickTexts() {
  let pool = null;
  let active = [];
  let cooldownTimer = 0;
  let recentIds = [];
  let isFirstClick = true;
  let currentLocale = null;

  async function ensurePool() {
    const locale = getLocale();
    if (pool && currentLocale === locale) return;
    currentLocale = locale;
    const mod = await import(`../data/texts-${locale}.js`);
    pool = mod.default;
  }

  function pickText(category) {
    const texts = pool[category];
    if (!texts || texts.length === 0) return null;
    // Avoid recent duplicates
    const available = texts.filter((_, i) => !recentIds.includes(category + ':' + i));
    const list = available.length > 0 ? available : texts;
    const idx = Math.floor(Math.random() * list.length);
    const text = list[idx];
    const globalIdx = texts.indexOf(text);
    recentIds.push(category + ':' + globalIdx);
    if (recentIds.length > 20) recentIds.shift();
    return text;
  }

  function spawn(x, y, text, category) {
    if (active.length >= MAX_ACTIVE) active.shift();
    active.push({
      x: x + (Math.random() - 0.5) * 60,
      y: y - 30 - Math.random() * 20,
      text,
      category,
      life: 2.5,
      maxLife: 2.5,
      vx: (Math.random() - 0.5) * 10,
      vy: -25 - Math.random() * 10,
      scale: 0.8,
      rotation: (Math.random() - 0.5) * 0.1,
    });
  }

  return {
    async onClick(x, y, context) {
      await ensurePool();
      if (!pool) return;

      const { stage, streak, isMilestone, isGoldenSpore } = context;

      // First click always shows text
      if (isFirstClick) {
        isFirstClick = false;
        const text = pickText('bio');
        if (text) spawn(x, y, text, 'bio');
        return;
      }

      // Golden spore click
      if (isGoldenSpore) {
        const text = pickText('golden');
        if (text) spawn(x, y, text, 'golden');
        return;
      }

      // Milestone click
      if (isMilestone) {
        const text = pickText('milestone');
        if (text) spawn(x, y, text, 'milestone');
        return;
      }

      // Frenzy streak
      if (streak >= FRENZY_STREAK) {
        const text = pickText('frenzy');
        if (text) spawn(x, y, text, 'frenzy');
        cooldownTimer = COOLDOWN;
        return;
      }

      // Normal chance
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
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        t.vy *= 0.98;
        t.life -= dt;
        // Scale animation: 0.8 → 1.0 in first 0.3s, then 1.0 → 0.6 at end
        const progress = 1 - t.life / t.maxLife;
        if (progress < 0.12) {
          t.scale = 0.8 + (progress / 0.12) * 0.2;
        } else {
          t.scale = 1.0 - (progress - 0.12) * 0.45;
        }
        if (t.life <= 0) active.splice(i, 1);
      }
    },

    render(ctx) {
      for (const item of active) {
        const alpha = Math.max(0, Math.min(1, item.life / (item.maxLife * 0.3)));
        const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.bio;
        const fontSize = item.category === 'frenzy' ? 18 : 14;
        const font = item.category === 'glitch' ? 'monospace' : 'sans-serif';

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        ctx.scale(item.scale, item.scale);

        ctx.font = `bold ${fontSize}px ${font}`;
        ctx.textAlign = 'center';

        // Glow
        let displayText = item.text;
        // Glitch: random char replacement
        if (item.category === 'glitch' && Math.random() < 0.3) {
          const chars = displayText.split('');
          const idx = Math.floor(Math.random() * chars.length);
          chars[idx] = String.fromCharCode(0x2580 + Math.floor(Math.random() * 32));
          displayText = chars.join('');
        }

        // Rainbow for combo
        let h = color.h;
        if (item.category === 'combo') {
          h = (Date.now() / 10) % 360;
        }

        ctx.fillStyle = `hsla(${h}, ${color.s}%, ${color.l}%, ${alpha * 0.3})`;
        ctx.fillText(displayText, 1, 1);
        ctx.fillStyle = `hsla(${h}, ${color.s}%, ${color.l}%, ${alpha})`;
        ctx.fillText(displayText, 0, 0);

        ctx.restore();
      }
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/ClickTexts.js
git commit -m "feat: add ClickTexts system with category triggers and rendering"
```

---

### Task 9: Wire ClickTexts into main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Import and init ClickTexts**

Add import at top of main.js:
```js
import { createClickTexts } from './ui/ClickTexts.js';
```

After `const toasts = createToastSystem();` add:
```js
const clickTexts = createClickTexts();
```

- [ ] **Step 2: Add click streak tracking**

After `let lastAutoSave = Date.now();` add:
```js
let clickStreak = 0;
let lastClickTime = 0;
```

- [ ] **Step 3: Wire onClick in click handler**

Inside `setupClickHandler` callback, after `floatingNumbers.add(x, y, totalClick);` add:

```js
// Click streak tracking
const now = Date.now();
if (now - lastClickTime < 200) {
  clickStreak++;
} else {
  clickStreak = 1;
}
lastClickTime = now;

// Click texts
clickTexts.onClick(x, y, {
  stage: state.stage,
  streak: clickStreak,
  isMilestone: null,
  isGoldenSpore: false,
  comboCount: 0,
  totalPixelsEarned: state.totalPixelsEarned,
});
```

Also in the golden spore branch (after `toasts.show(sporeResult.message, '#ffd700');`):
```js
clickTexts.onClick(x, y, {
  stage: state.stage,
  streak: 0,
  isMilestone: null,
  isGoldenSpore: true,
  comboCount: 0,
  totalPixelsEarned: state.totalPixelsEarned,
});
```

- [ ] **Step 4: Add milestone context to click texts**

In the milestones loop, after `toasts.show(...)`, store the most recent milestone:
```js
// Before the milestone loop, add:
let lastMilestoneReached = null;

// Inside the loop, after toasts.show:
lastMilestoneReached = name;
```

Then pass `isMilestone: lastMilestoneReached` in the click handler context (and reset it after use).

Actually, simpler approach: fire click text on milestone reach directly. After the milestone toast line:
```js
clickTexts.onClick(canvas.width / 2, canvas.height / 2, {
  stage: state.stage,
  streak: 0,
  isMilestone: name,
  isGoldenSpore: false,
  comboCount: 0,
  totalPixelsEarned: state.totalPixelsEarned,
});
```

- [ ] **Step 5: Add update and render calls**

In the update function (after `toasts.update(dt);`):
```js
clickTexts.update(dt);
```

In the render function (after `toasts.render(ctx, canvas.width);`):
```js
clickTexts.render(ctx);
```

- [ ] **Step 6: Test in browser**

Verify:
1. Click cells — occasional funny texts appear (15% chance, 3s cooldown)
2. Rapid clicks (10+ fast) — frenzy text appears
3. Stage 1 only shows bio texts
4. Stage 3+ shows glitch/existential
5. Golden spore click shows golden text
6. Texts float up, scale, and fade
7. Glitch texts have character replacement
8. Switch language → texts switch to that language

- [ ] **Step 7: Commit**

```bash
git add src/main.js
git commit -m "feat: wire ClickTexts into game loop with streak tracking"
```

---

### Task 10: Final Integration Test

- [ ] **Step 1: Full flow test**

Run dev server, test full flow:
1. Open game in Chrome
2. Language auto-detected correctly
3. Click [RU] button → all UI switches to Russian
4. Click [DE] button → all UI switches to German
5. Click [EN] button → back to English
6. Reload page → language persisted
7. Click cells → funny texts appear in current language
8. Buy upgrades → labels are translated
9. Reach milestones → toast text is translated
10. Golden spore → translated message + golden click text
11. Stage transitions → translated stage names

- [ ] **Step 2: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration fixes for i18n and click texts"
```
