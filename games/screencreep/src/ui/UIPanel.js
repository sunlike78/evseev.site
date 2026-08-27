// src/ui/UIPanel.js
import { formatNumber, canAfford } from '../game/Resources.js';
import { UPGRADE_DEFS, getUpgradeCost, purchaseUpgrade, isUpgradeLocked } from '../game/Upgrades.js';
import { DNA_UPGRADES, calcDNAPoints, canPrestige, purchaseDNAUpgrade, sporulate } from '../game/PrestigeManager.js';
import { getRunHealthLabel } from '../game/SessionDNA.js';
import { t, getLocale } from '../i18n/i18n.js';
import { TEXT_POOLS, CATEGORY_COLORS } from './ClickTexts.js';
import { downloadSpecimenCard } from './SpecimenCardGenerator.js';

let activeTab = 'biomass'; // 'biomass' | 'dna' | 'mutations' | 'archive'
let lastRenderedHTML = '';

export function createUIPanel(container, state, sfx, onSporulateCallback = null) {
  let lastRender = 0;
  const THROTTLE_MS = 200;

  const panel = {
    el: container,
    update() {
      const now = Date.now();
      if (now - lastRender < THROTTLE_MS) return;
      lastRender = now;
      renderPanel(container, state);
    },
    forceUpdate() {
      lastRender = 0;
      lastRenderedHTML = '';
      renderPanel(container, state);
    },
  };

  container.addEventListener('click', (e) => {
    // Tab click
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      activeTab = tabBtn.dataset.tab;
      panel.forceUpdate();
      return;
    }

    // Biomass Upgrade click
    const upgradeBtn = e.target.closest('[data-upgrade]');
    if (upgradeBtn && !upgradeBtn.disabled) {
      const id = upgradeBtn.dataset.upgrade;
      const bought = purchaseUpgrade(state, id);
      if (bought && sfx) sfx.upgradePop();
      panel.forceUpdate();
      return;
    }

    // Appetite Sacrifice click
    const sacrificeBtn = e.target.closest('[data-sacrifice]');
    if (sacrificeBtn) {
      const id = sacrificeBtn.dataset.sacrifice;
      if (!state.sacrifices) state.sacrifices = {};
      if (!state.sacrifices[id]) {
        state.sacrifices[id] = true;
        state.sacrificeMultiplier = (state.sacrificeMultiplier || 1) * 2.0;
        if (sfx) {
          sfx.membraneTear();
          sfx.splat();
        }
        panel.forceUpdate();
      }
      return;
    }

    // Download Specimen Card click
    const cardBtn = e.target.closest('[data-download-card]');
    if (cardBtn) {
      if (sfx) sfx.crystalPing(1200, 0.7);
      downloadSpecimenCard(state);
      return;
    }

    // DNA Upgrade click
    const dnaBtn = e.target.closest('[data-dna-upgrade]');
    if (dnaBtn && !dnaBtn.disabled) {
      const id = dnaBtn.dataset.dnaUpgrade;
      const bought = purchaseDNAUpgrade(state, id);
      if (bought && sfx) sfx.upgradePop();
      panel.forceUpdate();
      return;
    }

    // Sporulate click
    const sporulateBtn = e.target.closest('[data-sporulate]');
    if (sporulateBtn && !sporulateBtn.disabled) {
      const res = sporulate(state);
      if (res) {
        if (sfx) sfx.membraneTear();
        if (onSporulateCallback) onSporulateCallback(res);
        panel.forceUpdate();
      }
      return;
    }

    // Copy Seed click
    const copySeedBtn = e.target.closest('[data-copy-seed]');
    if (copySeedBtn) {
      const hex = state.sessionDNA?.seedHex || '0000';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(hex).then(() => {
          copySeedBtn.textContent = t('ui.copied');
          setTimeout(() => { panel.forceUpdate(); }, 1500);
        });
      }
      return;
    }
  });

  return panel;
}

function getEffectiveRate(state) {
  const base = state.autoClickRate || 0;
  const organ = state.organMultiplier || 1;
  const global = (state.globalMultiplier || 1) * (state.sacrificeMultiplier || 1);
  let rate = base * organ * global;

  // Session DNA mutations
  if (state.sessionDNA?.activeMutations?.includes('rapid_mitosis')) rate *= 1.5;
  if (state.sessionDNA?.activeMutations?.includes('cell_rot')) rate *= 0.6;
  if (state.sessionDNA?.activeMutations?.includes('neural_bloom')) rate *= 1.5;

  return rate;
}

function renderPanel(container, state) {
  const stageKeys = ['', 'seed', 'growth', 'breach', 'takeover', 'domination'];
  const stageName = t(`stage.${stageKeys[state.stage || 1]}`);
  const effectiveRate = getEffectiveRate(state);

  const dnaPoints = state.dnaPoints || 0;
  const prestigeAvailable = canPrestige(state);
  const potentialDNA = calcDNAPoints(state.totalPixelsEarned || 0, state);

  const archiveCount = state.whisperArchive?.length || 0;

  let html = `
    <div style="margin-bottom:8px">
      <div style="font-size:18px;color:#00ff88;text-shadow:0 0 10px rgba(0,255,136,0.3);font-weight:bold">${formatNumber(state.pixels)} px</div>
      <div style="color:#00aa66;font-size:11px;margin-top:2px">${formatNumber(effectiveRate)}/sec</div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;color:#335533;font-size:10px">
        <span>${t('ui.stage_format', { n: state.stage || 1, name: stageName })}</span>
        ${dnaPoints > 0 ? `<span style="color:#ffd700;font-weight:bold">${t('ui.dna_points', { n: dnaPoints })}</span>` : ''}
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display:flex;gap:2px;margin-bottom:8px;border-bottom:1px solid rgba(0,255,136,0.15);padding-bottom:4px;">
      <button data-tab="biomass" style="flex:1;background:${activeTab === 'biomass' ? 'rgba(0,255,136,0.15)' : 'none'};border:1px solid ${activeTab === 'biomass' ? '#00ff88' : '#223322'};color:${activeTab === 'biomass' ? '#00ff88' : '#668866'};font-family:monospace;font-size:9px;padding:3px 1px;border-radius:3px;cursor:pointer;">
        ${t('tab.biomass')}
      </button>
      <button data-tab="dna" style="flex:1;background:${activeTab === 'dna' ? 'rgba(255,215,0,0.15)' : 'none'};border:1px solid ${activeTab === 'dna' ? '#ffd700' : '#333322'};color:${activeTab === 'dna' ? '#ffd700' : '#888866'};font-family:monospace;font-size:9px;padding:3px 1px;border-radius:3px;cursor:pointer;">
        ${t('tab.dna')}
      </button>
      <button data-tab="mutations" style="flex:1;background:${activeTab === 'mutations' ? 'rgba(180,100,255,0.15)' : 'none'};border:1px solid ${activeTab === 'mutations' ? '#b464ff' : '#332233'};color:${activeTab === 'mutations' ? '#b464ff' : '#886688'};font-family:monospace;font-size:9px;padding:3px 1px;border-radius:3px;cursor:pointer;">
        ${t('tab.mutations')}
      </button>
      <button data-tab="archive" style="flex:1;background:${activeTab === 'archive' ? 'rgba(0,240,255,0.15)' : 'none'};border:1px solid ${activeTab === 'archive' ? '#00f0ff' : '#113333'};color:${activeTab === 'archive' ? '#00f0ff' : '#558888'};font-family:monospace;font-size:9px;padding:3px 1px;border-radius:3px;cursor:pointer;">
        Шёпот (${archiveCount})
      </button>
    </div>

    <div style="max-height:calc(100vh - 190px);overflow-y:auto;overflow-x:hidden;padding-right:2px;">
  `;

  if (activeTab === 'biomass') {
    if (state.sacrificeMultiplier && state.sacrificeMultiplier > 1) {
      html += `
        <div style="margin-bottom:6px;padding:4px 6px;background:rgba(255,50,50,0.08);border:1px solid #ff3333;border-radius:4px;font-size:9px;color:#ff8888;">
          🍖 <b>АППЕТИТ ОРГАНИЗМА:</b> x${state.sacrificeMultiplier.toFixed(1)} к общему доходу!
        </div>
      `;
    }

    for (const [id, def] of Object.entries(UPGRADE_DEFS)) {
      const isSacrificed = state.sacrifices?.[id];
      if (isSacrificed) {
        html += `
          <div style="
            display:block;width:100%;text-align:left;
            background:rgba(255,0,0,0.05);border:1px dashed #aa2222;color:#ff6666;
            padding:5px 6px;margin-bottom:4px;
            font-family:monospace;font-size:10px;border-radius:4px;opacity:0.85;
          ">
            <div style="display:flex;justify-content:space-between">
              <span style="text-decoration:line-through;">${t('upgrade.' + id + '.name')}</span>
              <span style="color:#ff4444;font-weight:bold;font-size:9px;">[СЪЕДЕНО: +200%]</span>
            </div>
            <div style="color:#aa5555;font-size:9px;margin-top:1px">Компонент поглощён биомассой ради эволюции.</div>
          </div>
        `;
        continue;
      }

      const level = state.upgrades?.[id] || 0;
      const cost = getUpgradeCost(id, level, state);
      const locked = isUpgradeLocked(id, state);
      const affordable = !locked && canAfford(state, cost);
      const color = locked ? '#333' : (affordable ? '#00ff88' : '#334433');
      const cursor = affordable ? 'pointer' : 'default';
      const lockNote = locked ? ` <span style="color:#664400;font-size:9px">${t('upgrade.locked')}</span>` : '';

      html += `
        <div style="margin-bottom:4px;">
          <button data-upgrade="${id}" ${locked || !affordable ? 'disabled' : ''} style="
            display:block;width:100%;text-align:left;
            background:${affordable ? 'rgba(0,255,136,0.06)' : 'rgba(0,255,136,0.02)'};
            border:1px solid ${color};color:${color};
            padding:5px 6px;cursor:${cursor};
            font-family:monospace;font-size:10px;border-radius:4px;
            transition:all 0.2s;
          ">
            <div style="display:flex;justify-content:space-between">
              <span>${t('upgrade.' + id + '.name')} <span style="opacity:0.6">Lv.${level}</span></span>
              <span style="font-size:9px">${formatNumber(cost)} px</span>
            </div>
            <div style="color:#446644;font-size:9px;margin-top:1px">${t('upgrade.' + id + '.desc')}${lockNote}</div>
          </button>
          ${state.stage >= 3 && level > 0 ? `
            <div style="display:flex;justify-content:flex-end;margin-top:1px;">
              <button data-sacrifice="${id}" style="background:none;border:none;color:#ff5555;font-family:monospace;font-size:8px;cursor:pointer;padding:1px 3px;text-decoration:underline;">
                🍖 Скормить биомассе (+200% буст)
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }
  } else if (activeTab === 'dna') {
    // Sporulation Prestige Section
    html += `
      <div style="margin-bottom:10px;padding:6px;background:rgba(255,215,0,0.05);border:1px solid ${prestigeAvailable ? '#ffd700' : '#443300'};border-radius:4px;">
        <div style="font-size:10px;color:#ffd700;font-weight:bold;margin-bottom:2px;">${t('ui.dna_title')}</div>
        <div style="font-size:9px;color:#888866;margin-bottom:6px;">
          ${prestigeAvailable ? `Colony Apex reached! Sporulate to rebirth with DNA.` : `Reach Stage 5 (20K px) to sporulate.`}
        </div>
        <button data-sporulate ${!prestigeAvailable ? 'disabled' : ''} style="
          display:block;width:100%;text-align:center;
          background:${prestigeAvailable ? 'rgba(255,215,0,0.2)' : 'rgba(100,100,50,0.05)'};
          border:1px solid ${prestigeAvailable ? '#ffd700' : '#444422'};
          color:${prestigeAvailable ? '#ffd700' : '#555533'};
          padding:6px;font-family:monospace;font-weight:bold;font-size:10px;border-radius:4px;
          cursor:${prestigeAvailable ? 'pointer' : 'default'};
        ">
          ${t('btn.sporulate', { dna: potentialDNA })}
        </button>
      </div>
    `;

    // DNA Permanent Upgrades
    for (const [id, def] of Object.entries(DNA_UPGRADES)) {
      const level = state.dnaUpgrades?.[id] || 0;
      const isMax = level >= def.maxLevel;
      const cost = isMax ? 0 : def.cost[level];
      const affordable = !isMax && (state.dnaPoints || 0) >= cost;
      const color = isMax ? '#888844' : (affordable ? '#ffd700' : '#444422');
      const cursor = affordable ? 'pointer' : 'default';

      html += `
        <button data-dna-upgrade="${id}" ${!affordable || isMax ? 'disabled' : ''} style="
          display:block;width:100%;text-align:left;
          background:${affordable ? 'rgba(255,215,0,0.06)' : 'rgba(255,215,0,0.01)'};
          border:1px solid ${color};color:${color};
          padding:5px 6px;margin-bottom:4px;cursor:${cursor};
          font-family:monospace;font-size:10px;border-radius:4px;
          transition:all 0.2s;
        ">
          <div style="display:flex;justify-content:space-between">
            <span>${t(def.nameKey)} <span style="opacity:0.6">${isMax ? 'MAX' : `Lv.${level}/${def.maxLevel}`}</span></span>
            <span style="font-size:9px">${isMax ? '—' : `${cost} DNA`}</span>
          </div>
          <div style="color:#888855;font-size:9px;margin-top:1px">${t(def.descKey)}</div>
        </button>
      `;
    }
  } else if (activeTab === 'mutations') {
    const dna = state.sessionDNA;
    const healthLabel = getRunHealthLabel(dna);
    const healthColor = healthLabel === 'Thriving' ? '#00ff88' : (healthLabel === 'Struggling' ? '#ff4444' : (healthLabel === 'Unstable' ? '#b464ff' : '#a0c0a0'));

    html += `
      <div style="margin-bottom:8px;padding:6px;background:rgba(180,100,255,0.05);border:1px solid #442255;border-radius:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:10px;color:#b464ff;font-weight:bold;">DNA: ${dna?.seedHex || '0000'}</span>
          <span style="font-size:9px;color:${healthColor};font-weight:bold;">${t(`run.${healthLabel.toLowerCase()}`)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:9px;color:#775588;">Yield Mod: ${dna?.dnaYieldMod || 1.0}x</span>
          <button data-copy-seed style="background:none;border:1px solid #7744aa;color:#b464ff;font-family:monospace;font-size:9px;padding:2px 5px;border-radius:3px;cursor:pointer;">
            ${t('ui.seed', { hex: dna?.seedHex || '0000' })} 📋
          </button>
        </div>
      </div>
    `;

    if (dna?.mutations) {
      for (const mut of dna.mutations) {
        const isRevealed = dna.activeMutations?.includes(mut.id);
        const dotColor = mut.type === 'positive' ? '#00ff88' : (mut.type === 'negative' ? '#ff4444' : '#b464ff');

        html += `
          <div style="
            padding:5px 6px;margin-bottom:4px;border-radius:4px;
            background:${isRevealed ? 'rgba(180,100,255,0.04)' : 'rgba(255,255,255,0.01)'};
            border:1px solid ${isRevealed ? 'rgba(180,100,255,0.2)' : '#221122'};
            font-size:10px;
          ">
            <div style="display:flex;align-items:center;gap:5px;">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${isRevealed ? dotColor : '#443344'};"></span>
              <span style="color:${isRevealed ? '#ddbbff' : '#554455'};font-weight:bold;">
                ${isRevealed ? t(mut.nameKey) : '??? (Unrevealed)'}
              </span>
            </div>
            <div style="color:${isRevealed ? '#886699' : '#332233'};font-size:9px;margin-top:2px;padding-left:11px;">
              ${isRevealed ? t(mut.descKey) : `Reveals at ${mut.revealAt} px`}
            </div>
          </div>
        `;
      }
    }
  } else if (activeTab === 'archive') {
    const locale = getLocale() || 'ru';
    const pool = TEXT_POOLS[locale] || TEXT_POOLS.en;
    let totalPhrases = 0;
    for (const arr of Object.values(pool)) {
      totalPhrases += arr.length;
    }

    const discovered = state.whisperArchive || [];
    const discoveredCount = discovered.length;
    const percent = Math.min(100, Math.round((discoveredCount / totalPhrases) * 100));

    html += `
      <div style="margin-bottom:8px;padding:6px;background:rgba(0,240,255,0.05);border:1px solid #114455;border-radius:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:10px;color:#00f0ff;font-weight:bold;">АРХИВ ШЁПОТА: ${discoveredCount}/${totalPhrases}</span>
          <span style="font-size:9px;color:#00ccbb;">${percent}%</span>
        </div>
        <div style="width:100%;height:4px;background:#051520;border-radius:2px;overflow:hidden;margin-bottom:6px;">
          <div style="width:${percent}%;height:100%;background:#00f0ff;"></div>
        </div>
        <button data-download-card style="
          width:100%;background:rgba(0,240,255,0.15);border:1px solid #00f0ff;
          color:#00f0ff;font-family:monospace;font-weight:bold;font-size:9px;
          padding:5px;border-radius:3px;cursor:pointer;text-align:center;
        ">
          📸 Скачать Паспорт Образца (PNG)
        </button>
      </div>
    `;

    if (discovered.length === 0) {
      html += `
        <div style="text-align:center;color:#446666;font-size:10px;padding:12px;">
          Кликайте по организму, чтобы перехватывать его мысли в этот журнал...
        </div>
      `;
    } else {
      const reversed = [...discovered].reverse();
      for (const item of reversed) {
        const catInfo = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.bio;
        html += `
          <div style="
            padding:5px 6px;margin-bottom:4px;border-radius:4px;
            background:rgba(0,240,255,0.03);border:1px solid rgba(0,240,255,0.15);
            font-size:10px;
          ">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
              <span style="color:hsla(${catInfo.h}, ${catInfo.s}%, ${catInfo.l}%, 0.9);font-size:8px;font-weight:bold;">[${catInfo.label || item.category}]</span>
              <span style="color:#335555;font-size:8px;">#${item.id}</span>
            </div>
            <div style="color:#cceeff;font-size:9px;line-height:1.3;">
              «${item.text}»
            </div>
          </div>
        `;
      }
    }
  }

  html += '</div>';

  if (html !== lastRenderedHTML) {
    lastRenderedHTML = html;
    container.innerHTML = html;
  }
}
