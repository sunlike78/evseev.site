// src/ui/SpecimenCardGenerator.js
import { getLocale } from '../i18n/i18n.js';
import { formatNumber } from '../game/Resources.js';

export function generateSpecimenCard(state) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // 1. Deep Obsidian Background
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, 600, 800);

  // 2. Cyber-Bio Border & Scanlines
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 568, 768);

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 20; y < 780; y += 4) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(580, y);
    ctx.stroke();
  }

  // 3. Header
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#00ff88';
  ctx.textAlign = 'center';
  ctx.fillText('☣ BIOHAZARD SPECIMEN PASSPORT ☣', 300, 52);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#779988';
  ctx.fillText('PROJECT SCREENCREEP // AUTONOMOUS CELLULAR INVASION', 300, 72);

  // 4. Central Specimen Hologram Circle
  ctx.save();
  ctx.translate(300, 240);

  // Halo
  const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, 120);
  grad.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
  grad.addColorStop(0.6, 'rgba(0, 255, 136, 0.1)');
  grad.addColorStop(1, 'rgba(0, 255, 136, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.fill();

  // Amoeba Silhouette
  ctx.fillStyle = '#003322';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = 70 + Math.sin(angle * 3) * 12 + Math.cos(angle * 2) * 8;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nucleus
  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.arc(-15, -15, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-22, -22, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 5. Specimen Metrics & Telemetry
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#00ff88';

  const dna = state.sessionDNA;
  const metrics = [
    `GENOME SEED:    #${dna?.seedHex || '0000'}`,
    `CURRENT STAGE:  STAGE ${state.stage || 1}`,
    `TOTAL BIOMASS:  ${formatNumber(state.totalPixelsEarned || 0)} px`,
    `SACRIFICES:     ${Object.keys(state.sacrifices || {}).length} UI COMPONENTS CONSUMED`,
    `LORE ARCHIVE:   ${state.whisperArchive?.length || 0} THOUGHTS EXTRACTED`,
    `STATUS:         CONTAINMENT BREACH IN PROGRESS`,
  ];

  let my = 410;
  for (const m of metrics) {
    ctx.fillText(m, 40, my);
    my += 26;
  }

  // 6. Latest Whisper Quote
  const lastThought = state.whisperArchive?.[state.whisperArchive.length - 1]?.text || '«Митоз не остановить.»';
  ctx.fillStyle = 'rgba(0, 255, 136, 0.06)';
  ctx.fillRect(36, 580, 528, 100);
  ctx.strokeStyle = '#00aa66';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 580, 528, 100);

  ctx.font = 'italic 13px monospace';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';

  // Word wrap thought
  const words = `"${lastThought}"`.split(' ');
  let line = '';
  let qy = 618;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 480 && n > 0) {
      ctx.fillText(line, 300, qy);
      line = words[n] + ' ';
      qy += 22;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 300, qy);

  // 7. Footer Viral Hook (Hook for the Viewer)
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#ff4444';
  ctx.textAlign = 'center';
  ctx.fillText('⚠ ЭТОТ ОБРАЗЕЦ ТЕПЕРЬ ЗНАЕТ И О ТВОЁМ ЭКРАНЕ ТОЖЕ ⚠', 300, 725);

  ctx.font = '11px monospace';
  ctx.fillStyle = '#557766';
  ctx.fillText('PLAY AT: HTTP://127.0.0.1:8080/GAMES/SCREENCREEP/ // #SCREENCREEP', 300, 748);

  return canvas.toDataURL('image/png');
}

export function downloadSpecimenCard(state) {
  const dataUrl = generateSpecimenCard(state);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `ScreenCreep_Specimen_${state.sessionDNA?.seedHex || '0000'}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
